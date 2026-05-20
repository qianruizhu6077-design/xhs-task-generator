export const groups = {
  '1组': [
    { name: '嘻嘻嘻嘻', canComment: true, num: 1, commentPriority: 1, canAddV: true },
    { name: '第二年春', canComment: false, num: 1, commentPriority: 0, canAddV: false },
    { name: '11111', canComment: true, num: 2, commentPriority: 2, canAddV: false },
  ],

  '2组': [
    { name: '嘻嘻嘻嘻 ', canComment: true, num: 1, commentPriority: 1, canAddV: true },
    { name: '黛黛 ', canComment: true, num: 1, commentPriority: 2, canAddV: true },
    { name: '^ω^', canComment: false, num: 3, commentPriority: 0, canAddV: false },
    { name: '11111', canComment: false, num: 1, commentPriority: 4, canAddV: false },
    { name: '差不多先生', canComment: false, num: 1, commentPriority: 0, canAddV: false },
    { name: 'YYC', canComment: false, num: 1, commentPriority: 3, canAddV: false },
  ],

  '3组': [
    { name: '第二年春', canComment: true, num: 1, commentPriority: 5, canAddV: true },
    { name: '风灵无畏', canComment: true, num: 2, commentPriority: 1, canAddV: false },
    { name: '阿巴阿巴', canComment: true, num: 2, commentPriority: 2, canAddV: true },
    { name: 'Tom Green', canComment: true, num: 2, commentPriority: 4, canAddV: false },
    { name: '春山', canComment: true, num: 1, commentPriority: 1, canAddV: true },
  ],
}

export const normalActions = [
  '点赞',
  '点赞➕收藏',
  '点赞➕关注',
]

export const leadActions: Record<string, string[]> = {
  '1组': [
    '点赞➕评论：想了解一下',
    '点赞➕评论：dd'
  ],
  '2组': [
    '点赞➕评论：礼貌问价',
    '点赞➕评论：怎么联系？',
  ],
  '3组': [
    '点赞➕评论：感兴趣，联系一下吧',
    '点赞➕评论：怎么收费的',
  ],
}
