<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { generateTask } from './utils/generator'

const groupName = ref('1组')

const ipText = ref(`天津*1
四川*1`)

const result = ref('')

function handleGenerate() {
  result.value = generateTask(groupName.value, ipText.value)

}

async function handleCopy() {
  await navigator.clipboard.writeText(result.value)
  ElMessage.success('复制成功')
}
</script>

<template>
  <div class="container">
    <div class="card">
      <h2>生成结果</h2>

      <el-form label-width="100px">
        <el-form-item label="选择组">
          <el-select v-model="groupName">
            <el-option label="1组" value="1组" />
            <el-option label="2组" value="2组" />
            <el-option label="3组" value="3组" />
          </el-select>
        </el-form-item>

        <el-form-item label="输入IP">
          <el-input
            v-model="ipText"
            type="textarea"
            :rows="10"
            placeholder="吉林*2"
          />
        </el-form-item>
      </el-form>

      <div class="btns">
        <el-button type="primary" @click="handleGenerate">
          生成任务
        </el-button>

        <el-button @click="handleCopy">
          一键复制
        </el-button>
      </div>

      <div class="result">
        <pre>{{ result }}</pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
.container {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 40px;
}

.card {
  max-width: 900px;
  margin: auto;
  background: white;
  padding: 30px;
  border-radius: 12px;
}

.btns {
  margin: 20px 0;
  display: flex;
  gap: 12px;
}

.result {
  background: #222;
  color: #00ff88;
  padding: 20px;
  border-radius: 10px;
  margin-top: 20px;
}

pre {
  white-space: pre-wrap;
  line-height: 1.8;
}
</style>
