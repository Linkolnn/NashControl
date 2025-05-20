import { defineStore } from 'pinia'
import { saveProblems, getProblems } from '@/utils/storage'

export const useProblemsStore = defineStore('problems', {
  state: () => ({
    problems: [],
    loading: false,
    selectedProblem: null
  }),
  
  getters: {
    getProblems: (state) => state.problems,
    getProblemById: (state) => (id) => state.problems.find(p => p.id === id),
    getProblemsByStatus: (state) => (status) => state.problems.filter(p => p.status === status)
  },
  
  actions: {
    async fetchProblems() {
      this.loading = true
      try {
        // Сначала пытаемся загрузить из localStorage
        const localProblems = getProblems()
        
        if (localProblems && localProblems.length > 0) {
          this.problems = localProblems
        } else {
          // Если в localStorage нет данных, загружаем из JSON-файла
          const data = await import('@/data/problems.json').then(m => m.default || m)
          this.problems = data
          // Сохраняем в localStorage для будущего использования
          saveProblems(this.problems)
        }
      } catch (error) {
        console.error('Error fetching problems:', error)
      } finally {
        this.loading = false
      }
    },
    
    async addProblem(problem) {
      try {
        const newProblem = {
          ...problem,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: 'Новая'
        }
        
        this.problems.push(newProblem)
        await this.saveProblemData()
        return { success: true, id: newProblem.id }
      } catch (error) {
        console.error('Error adding problem:', error)
        return { success: false, message: 'Ошибка при добавлении проблемы' }
      }
    },
    
    async updateProblemStatus(id, status) {
      try {
        const problem = this.problems.find(p => p.id === id)
        if (problem) {
          problem.status = status
          problem.updatedAt = new Date().toISOString()
          await this.saveProblemData()
          return { success: true }
        }
        return { success: false, message: 'Проблема не найдена' }
      } catch (error) {
        console.error('Error updating problem status:', error)
        return { success: false, message: 'Ошибка при обновлении статуса' }
      }
    },
    
    async updateProblem(updatedProblem) {
      try {
        const index = this.problems.findIndex(p => p.id === updatedProblem.id)
        if (index !== -1) {
          // Обновляем дату изменения
          updatedProblem.updatedAt = new Date().toISOString()
          // Заменяем проблему в массиве
          this.problems[index] = { ...updatedProblem }
          await this.saveProblemData()
          return { success: true }
        }
        return { success: false, message: 'Проблема не найдена' }
      } catch (error) {
        console.error('Error updating problem:', error)
        return { success: false, message: 'Ошибка при обновлении проблемы' }
      }
    },
    
    async deleteProblem(id) {
      try {
        const index = this.problems.findIndex(p => p.id === id)
        if (index !== -1) {
          this.problems.splice(index, 1)
          await this.saveProblemData()
          return { success: true }
        }
        return { success: false, message: 'Проблема не найдена' }
      } catch (error) {
        console.error('Error deleting problem:', error)
        return { success: false, message: 'Ошибка при удалении проблемы' }
      }
    },
    
    selectProblem(problem) {
      this.selectedProblem = problem
    },
    
    clearSelectedProblem() {
      this.selectedProblem = null
    },
    
    async saveProblemData() {
      // Сохраняем проблемы в localStorage
      const saved = saveProblems(this.problems)
      if (!saved) {
        console.error('Не удалось сохранить проблемы в localStorage')
      }
      return saved
    }
  }
})
