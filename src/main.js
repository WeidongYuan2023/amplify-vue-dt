import { createApp } from 'vue'
import './assets/styles/style.scss'
import App from './App.vue'
import { createPinia } from 'pinia'
import router from './router'

// 导入Amplify和Amplify UI
import { Amplify } from 'aws-amplify'
import '@aws-amplify/ui-vue/styles.css'

// 导入Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 配置Amplify - 使用v5格式
Amplify.configure({
  // 基本项目配置
  aws_project_region: 'us-east-1',
  
  // 认证配置
  aws_cognito_region: 'us-east-1',
  aws_user_pools_id: 'us-east-1_VYpunvTHN',
  aws_user_pools_web_client_id: '4ssdtabhna12tt88kd2h08cinh', // 新的客户端ID
  
  // 额外配置 - 修改这里以支持邮箱作为用户名
  aws_cognito_username_attributes: [], // 清空，允许直接使用邮箱
  aws_cognito_signup_attributes: ['EMAIL'],
  aws_cognito_mfa_configuration: 'OFF',
  aws_cognito_password_protection_settings: {
    passwordPolicyMinLength: 8,
    passwordPolicyCharacters: []
  },
  aws_cognito_verification_mechanisms: ['EMAIL']
});

const app = createApp(App)
const pinia = createPinia()

// 使用插件
app.use(pinia)
app.use(ElementPlus)
app.use(router)

app.mount('#app')
