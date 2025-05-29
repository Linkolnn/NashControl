import { defineStore } from 'pinia'

// Функция для получения комментариев из localStorage
const getCommentsFromStorage = (problemId) => {
  try {
    const commentsData = localStorage.getItem(`comments_${problemId}`)
    return commentsData ? JSON.parse(commentsData) : []
  } catch (error) {
    console.error('Ошибка при получении комментариев из localStorage:', error)
    return []
  }
}

// Функция для сохранения комментариев в localStorage
const saveCommentsToStorage = (problemId, comments) => {
  try {
    localStorage.setItem(`comments_${problemId}`, JSON.stringify(comments))
    return true
  } catch (error) {
    console.error('Ошибка при сохранении комментариев в localStorage:', error)
    return false
  }
}

export const useCommentsStore = defineStore('comments', {
  state: () => ({
    // Комментарии хранятся в объекте, где ключ - ID проблемы
    commentsByProblemId: {},
    loading: false
  }),
  
  getters: {
    // Получение комментариев для конкретной проблемы
    getCommentsByProblemId: (state) => (problemId) => {
      return state.commentsByProblemId[problemId] || []
    }
  },
  
  actions: {
    // Загрузка комментариев для проблемы
    loadComments(problemId) {
      this.loading = true
      try {
        const comments = getCommentsFromStorage(problemId)
        this.commentsByProblemId[problemId] = comments
      } catch (error) {
        console.error('Ошибка при загрузке комментариев:', error)
      } finally {
        this.loading = false
      }
    },
    
    // Добавление нового комментария
    addComment(problemId, commentText, authorName = 'Анонимный пользователь') {
      try {
        // Создаем новый комментарий
        const newComment = {
          id: Date.now().toString(),
          text: commentText,
          author: authorName,
          createdAt: new Date().toISOString(),
          problemId
        }
        
        // Инициализируем массив комментариев для проблемы, если его еще нет
        if (!this.commentsByProblemId[problemId]) {
          this.commentsByProblemId[problemId] = []
        }
        
        // Добавляем комментарий в массив
        this.commentsByProblemId[problemId].push(newComment)
        
        // Сохраняем в localStorage
        saveCommentsToStorage(problemId, this.commentsByProblemId[problemId])
        
        return { success: true, comment: newComment }
      } catch (error) {
        console.error('Ошибка при добавлении комментария:', error)
        return { success: false, message: 'Не удалось добавить комментарий' }
      }
    },
    
    // Удаление комментария (для админов)
    deleteComment(problemId, commentId) {
      try {
        if (!this.commentsByProblemId[problemId]) {
          return { success: false, message: 'Комментарии не найдены' }
        }
        
        const initialLength = this.commentsByProblemId[problemId].length
        this.commentsByProblemId[problemId] = this.commentsByProblemId[problemId].filter(
          comment => comment.id !== commentId
        )
        
        if (this.commentsByProblemId[problemId].length === initialLength) {
          return { success: false, message: 'Комментарий не найден' }
        }
        
        // Сохраняем обновленный список в localStorage
        saveCommentsToStorage(problemId, this.commentsByProblemId[problemId])
        
        return { success: true }
      } catch (error) {
        console.error('Ошибка при удалении комментария:', error)
        return { success: false, message: 'Не удалось удалить комментарий' }
      }
    }
  }
})
