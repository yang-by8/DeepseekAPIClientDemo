

// alert(location.hostname)
// Ollama 服务地址 (默认地址)
// const OLLAMA_API_URL = 'http://'+location.hostname+':5010/ollama';
// const OLLAMA_API_URL = 'http://192.168.15.39:11434/api';

// DOM 元素
const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const modelSelect = document.getElementById('model');
const connectionStatus = document.getElementById('connection-status');

 let isConnectedAPI=false;
// 创建自定义配置的客户端
import OpenAI from "openai";

const openai = new OpenAI({
        baseURL: 'https://api.deepseek.com',
        apiKey: 'api_token',// deepseek api 的有效token
        dangerouslyAllowBrowser: true // 明确告知允许在浏览器中运行
});

async function sendClientMsg(params) {

    const inputMsg = userInput.value.trim();
    if (!inputMsg) 
        return;

    // 检查连接状态
    // const isConnected = await checkAPIConnection();
    if (!isConnectedAPI) {
        alert('无法连接到 AI 服务，请确保网络已连接');
        return;
    }

    // 添加用户消息
    addMessage(inputMsg, true);
    sendBtn.disabled = true;
  // 添加加载指示器
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'message bot-message';
  loadingDiv.innerHTML = '<div class="loading-indicator"></div>';
  chatContainer.appendChild(loadingDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
   
    
    // const response = await openai.chat({ 
    //   model: modelSelect.value,
    //   messages: [message], 
    //   keep_alive:'35m',
    //   stream: true, // 启用流式
    // });

     const message = { role: 'user', content: inputMsg };
     const response = await openai.chat.completions.create({
      model: modelSelect.value, // 指定 DeepSeek 模型
      messages: [
        { role: "system", content: "你是一个有帮助的助手。" },
        message,
      ],
      stream: true, // 启用流式输出
    });

    
    const isUser = false;
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    chatContainer.appendChild(messageDiv);

     // 移除加载指示器
    chatContainer.removeChild(loadingDiv);

    let isFirst=true;

    // 逐步接收输出
    for await (const part of response) {
       console.log(JSON.stringify(part));
      const content = part.choices[0]?.delta?.content;
      const reasoning_content= part.choices[0]?.delta?.reasoning_content;

      if (reasoning_content) {
        // 逐块打印内容，实现流式效果
        messageDiv.textContent +=reasoning_content;
      }

      if (content) {
        // 逐块打印内容，实现流式效果
        //process.stdout.write(content);
        if(isFirst)
        {
          messageDiv.textContent +=" \n \n";
          isFirst=false;
        }
        messageDiv.textContent +=content;
      }

      chatContainer.scrollTop = chatContainer.scrollHeight;

    }

      sendBtn.disabled = false;

}

// 检查 AI 服务是否可用
async function checkAPIConnection() {

  try 
  {

      const models = await openai.models.list()
      for await (const model of models) {
        console.log(model);
      }

      connectionStatus.textContent = '已连接';
      connectionStatus.classList.add('connected');
      isConnectedAPI=true;
      return true;
    
  } 
  catch (error) 
  {
      console.error('无法连接到 Deepseekapi 服务:', error);
  }
  connectionStatus.textContent = '未连接';
  connectionStatus.classList.remove('connected');
  isConnectedAPI=false;
  return false; 

}

// 添加消息到聊天界面
function addMessage(content, isUser = false) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
  messageDiv.textContent = content;
  chatContainer.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return messageDiv;
}

// 事件监听
sendBtn.addEventListener('click', sendClientMsg);

userInput.addEventListener('keydown', (e) => {
  // 按 Ctrl+Enter 发送消息
  if (e.ctrlKey && e.key === 'Enter') {
    sendClientMsg();
  }
});

// 页面加载时检查连接
window.addEventListener('load', checkAPIConnection);

// 模型选择变化时检查连接
modelSelect.addEventListener('change', checkAPIConnection);





