import { ElMessage } from 'element-plus'

// 将element中的Message消息提醒功能进行封装
// 因为我们有不同种类的消息提醒，因此对 ELMessage 进行了简单封装方便使用
const showMessage = (msg, callback, type) => {
    ElMessage({
        type: type,
        message: msg,
        duration: 2000,
        onClose: () => {
            if (callback) {
                callback()
            }
        }
    })
}

const message = {
    error: (msg, callback) => {
        showMessage(msg, callback, "error")
    },
    success: (msg, callback) => {
        showMessage(msg, callback, "success")
    },
    warning: (msg, callback) => {
        showMessage(msg, callback, "warning")
    }
}

export default message;