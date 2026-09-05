import { addTodo, listTodos } from './todos'
import {
  getPlans,
  getSubscription,
  createCheckout,
  cancelSubscription,
  resumeSubscription,
} from './payments'
import {
  listUserForms,
  createForm,
  getForm,
  updateFormFields,
  deleteForm,
  submitFormResponse,
  getFormSubmissions,
} from './forms'
import {
  startEngineeringSession,
  getSession,
  listSpecialists,
  getSpecialist,
  runSpecialistExecution,
  clarifyOrAnalyzeGoal,
  refineSpecialist,
} from './engineer'

export default {
  listTodos,
  addTodo,
  billing: {
    getPlans,
    getSubscription,
    createCheckout,
    cancelSubscription,
    resumeSubscription,
  },
  forms: {
    listUserForms,
    createForm,
    getForm,
    updateFormFields,
    deleteForm,
    submitFormResponse,
    getFormSubmissions,
  },
  engineer: {
    clarifyOrAnalyzeGoal,
    startEngineeringSession,
    getSession,
    listSpecialists,
    getSpecialist,
    runSpecialistExecution,
    refineSpecialist,
  },
}

