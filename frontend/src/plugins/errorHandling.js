import { ElNotification } from 'element-plus'

export function installErrorHandling(app) {
  app.config.errorHandler = (err, instance, info) => {
    ElNotification({
      title: '页面异常',
      message: err?.message || `未知异常: ${info || ''}`,
      type: 'error',
      duration: 2800,
    })
  }

  window.addEventListener('unhandledrejection', (event) => {
    const message = event?.reason?.message || '出现未处理的异步错误'
    ElNotification({
      title: '运行异常',
      message,
      type: 'error',
      duration: 2800,
    })
  })
}
