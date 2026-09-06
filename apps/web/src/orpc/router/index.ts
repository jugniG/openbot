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
  initiateAgentChat,
  refineSpecialist,
  saveAgentEnv,
  deleteAgentEnv,
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
    initiateAgentChat,
    startEngineeringSession,
    getSession,
    listSpecialists,
    getSpecialist,
    runSpecialistExecution,
    refineSpecialist,
    saveAgentEnv,
    deleteAgentEnv,
  },
}

