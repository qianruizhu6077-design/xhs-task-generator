import { groups, leadActions } from '../data/config'

function randomItem(arr: string[]) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function pickNormalAction(ip: string, countMap: Map<string, { fav: number; follow: number }>): string {
  const counts = countMap.get(ip)!
  const candidates: string[] = ['点赞']
  if (counts.fav < 2) candidates.push('点赞➕收藏')
  if (counts.follow < 1) candidates.push('点赞➕关注')
  const pick = randomItem(candidates)
  if (pick === '点赞➕收藏') counts.fav++
  else if (pick === '点赞➕关注') counts.follow++
  return pick
}

function shuffleArray<T>(array: T[]): T[] {
  return [...array].sort(() => Math.random() - 0.5)
}

export function generateTask(groupName: string, ipText: string) {
  const members = groups[groupName as keyof typeof groups]
  const groupLeadActions = leadActions[groupName] || []

  if (!members) return ''

  // 解析IP列表
  const ips: string[] = []
  const ipPrivateMsg = new Map<string, boolean>()
  ipText.split('\n').forEach((line) => {
    const text = line.trim()
    if (!text) return
    if (text.includes('*')) {
      const [ip, count] = text.split('*')
      const cleanIp = ip.trim().replace(/[（(]私[）)]/, '')
      const isPrivate = /[（(]私[）)]/.test(ip.trim())
      for (let i = 0; i < Number(count); i++) ips.push(cleanIp)
      if (isPrivate) ipPrivateMsg.set(cleanIp, true)
    } else {
      const cleanIp = text.replace(/[（(]私[）)]/, '')
      const isPrivate = /[（(]私[）)]/.test(text)
      ips.push(cleanIp)
      if (isPrivate) ipPrivateMsg.set(cleanIp, true)
    }
  })

  if (ips.length === 0) return ''

  // 展开所有号：每个成员的每个号作为一个单元
  type Unit = { name: string; index: number; num: number; canComment: boolean; commentPriority: number; canAddV: boolean }
  const units: Unit[] = []
  members.forEach((member) => {
    const count = member.num || 1
    for (let i = 0; i < count; i++) {
      units.push({ name: member.name, index: i, num: count, canComment: member.canComment, commentPriority: member.commentPriority || 0, canAddV: member.canAddV || false })
    }
  })

  // 为每个号分配一个IP
  // 策略：先确保每个IP至少分配一个可评论的unit，再分配剩余的
  const ipSet = [...new Set(ips)]
  const commentablePool = shuffleArray(units.filter((u) => u.canComment))
  const nonCommentablePool = shuffleArray(units.filter((u) => !u.canComment))

  // 优先为每个IP分配一个可评论unit
  const priorityAssigned: Unit[] = []
  const remaining: Unit[] = []
  for (let i = 0; i < commentablePool.length; i++) {
    if (i < ipSet.length) {
      priorityAssigned.push(commentablePool[i])
    } else {
      remaining.push(commentablePool[i])
    }
  }
  // 按顺序：先保证每个IP一个可评论unit，再分配剩余
  const orderedUnits = [...priorityAssigned, ...remaining, ...nonCommentablePool]

  const unitIpMap = new Map<string, string>() // key: "name_index" -> ip
  orderedUnits.forEach((unit, idx) => {
    const ip = ipSet[idx % ipSet.length]
    unitIpMap.set(`${unit.name}_${unit.index}`, ip)
  })

  const shuffledUnits = orderedUnits

  // 决定哪些可评论的号执行评论动作（按优先级排序，数字小的优先评论）
  const commentableUnits = shuffledUnits.filter((u) => u.canComment)
  // 按优先级升序排序，数字越小越优先分配评论
  const sortedByPriority = [...commentableUnits].sort((a, b) => a.commentPriority - b.commentPriority)

  const commentSet = new Set<string>()
  const ipCommentCount = new Map<string, number>()

  // 第一轮：确保每个IP至少分配1个评论（优先canAddV的号）
  const ipHasComment = new Set<string>()
  // 先用canAddV的号覆盖IP
  sortedByPriority.filter((u) => u.canAddV).forEach((unit) => {
    const key = `${unit.name}_${unit.index}`
    const ip = unitIpMap.get(key)!
    if (!ipHasComment.has(ip)) {
      ipHasComment.add(ip)
      commentSet.add(key)
      ipCommentCount.set(ip, (ipCommentCount.get(ip) || 0) + 1)
    }
  })
  // 再用其他可评论号补充未覆盖的IP
  sortedByPriority.forEach((unit) => {
    const key = `${unit.name}_${unit.index}`
    const ip = unitIpMap.get(key)!
    if (!ipHasComment.has(ip)) {
      ipHasComment.add(ip)
      commentSet.add(key)
      ipCommentCount.set(ip, (ipCommentCount.get(ip) || 0) + 1)
    }
  })

  // 第二轮：有余量的话，每个IP再多分配评论（最多2个）
  sortedByPriority.forEach((unit) => {
    const key = `${unit.name}_${unit.index}`
    if (commentSet.has(key)) return
    const ip = unitIpMap.get(key)!
    if ((ipCommentCount.get(ip) || 0) < 2) {
      commentSet.add(key)
      ipCommentCount.set(ip, (ipCommentCount.get(ip) || 0) + 1)
    }
  })

  // 按IP分块生成结果
  let text = ''

  ipSet.forEach((currentIp) => {
    // 追踪当前IP下已使用的评论内容，避免重复
    const usedComments = new Set<string>()
    const normalActionCount = new Map<string, { fav: number; follow: number }>()
    normalActionCount.set(currentIp, { fav: 0, follow: 0 })

    text += `——————\n${currentIp}：\n\n`

    // 按评论优先级排序显示：有评论任务的按commentPriority升序排前面，无评论的保持原顺序在后面
    const memberNames = [...new Set(members.map((m) => m.name))]
    const commentMembers: string[] = []
    const nonCommentMembers: string[] = []
    memberNames.forEach((name) => {
      const member = members.find((m) => m.name === name)!
      const count = member.num || 1
      const hasComment = Array.from({ length: count }, (_, i) => `${name}_${i}`)
        .some((key) => commentSet.has(key) && unitIpMap.get(key) === currentIp)
      if (hasComment) commentMembers.push(name)
      else nonCommentMembers.push(name)
    })
    commentMembers.sort((a, b) => {
      const pa = members.find((m) => m.name === a)!.commentPriority || 0
      const pb = members.find((m) => m.name === b)!.commentPriority || 0
      return pa - pb
    })
    const orderedNames = [...commentMembers, ...nonCommentMembers]

    orderedNames.forEach((name) => {
      const member = members.find((m) => m.name === name)!
      const count = member.num || 1

      text += `@${name}\n`

      if (count === 1) {
        const key = `${name}_0`
        const ip = unitIpMap.get(key)!
        const shouldComment = commentSet.has(key) && member.canComment && ip === currentIp
        let action: string
        if (shouldComment) {
          const available = groupLeadActions.filter((a) => !usedComments.has(a))
          const pick = available.length > 0 ? randomItem(available) : randomItem(groupLeadActions)
          usedComments.add(pick)
          action = pick
        } else {
          action = pickNormalAction(currentIp, normalActionCount)
        }
        if (shouldComment && ipPrivateMsg.get(currentIp)) action = action.replace('评论', '私信')
        if (shouldComment && member.canAddV) action += '（➕v）'
        text += `IP${ip} ${action}\n`
      } else {
        for (let i = 0; i < count; i++) {
          const key = `${name}_${i}`
          const ip = unitIpMap.get(key)!
          const shouldComment = commentSet.has(key) && member.canComment && ip === currentIp
          let action: string
          if (shouldComment) {
            const available = groupLeadActions.filter((a) => !usedComments.has(a))
            const pick = available.length > 0 ? randomItem(available) : randomItem(groupLeadActions)
            usedComments.add(pick)
            action = pick
          } else {
            action = pickNormalAction(currentIp, normalActionCount)
          }
          if (shouldComment && ipPrivateMsg.get(currentIp)) action = action.replace('评论', '私信')
          if (shouldComment && member.canAddV) action += '（➕v）'
          text += `一个IP${ip}，${action}\n`
        }
      }

      text += '\n'
    })
  })

  text += '——————'

  return text
}
