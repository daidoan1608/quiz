export const createInitialExamAttemptState = () => ({
  questions: [],
  selectedAnswers: {},
  timeLeft: null,
  duration: 0,
  title: '',
  subjectName: '',
  currentQuestionIndex: 0,
  isLoading: true,
  startTime: new Date().toISOString(),
  isDraftReady: false,
  userExamId: null,
  isSubmitConfirmOpen: false,
  isSubmitting: false,
});

export const examAttemptActions = {
  SET_CURRENT_QUESTION_INDEX: 'SET_CURRENT_QUESTION_INDEX',
  SET_DURATION: 'SET_DURATION',
  SET_IS_DRAFT_READY: 'SET_IS_DRAFT_READY',
  SET_IS_LOADING: 'SET_IS_LOADING',
  SET_IS_SUBMIT_CONFIRM_OPEN: 'SET_IS_SUBMIT_CONFIRM_OPEN',
  SET_IS_SUBMITTING: 'SET_IS_SUBMITTING',
  SET_QUESTIONS: 'SET_QUESTIONS',
  SET_SELECTED_ANSWERS: 'SET_SELECTED_ANSWERS',
  SET_START_TIME: 'SET_START_TIME',
  SET_SUBJECT_NAME: 'SET_SUBJECT_NAME',
  SET_TIME_LEFT: 'SET_TIME_LEFT',
  SET_TITLE: 'SET_TITLE',
  SET_USER_EXAM_ID: 'SET_USER_EXAM_ID',
};

const resolveReducerValue = (valueOrUpdater, previousValue) =>
  typeof valueOrUpdater === 'function'
    ? valueOrUpdater(previousValue)
    : valueOrUpdater;

export const examAttemptReducer = (state, action) => {
  switch (action.type) {
    case examAttemptActions.SET_CURRENT_QUESTION_INDEX:
      return {
        ...state,
        currentQuestionIndex: resolveReducerValue(
          action.payload,
          state.currentQuestionIndex
        ),
      };
    case examAttemptActions.SET_DURATION:
      return { ...state, duration: action.payload };
    case examAttemptActions.SET_IS_DRAFT_READY:
      return { ...state, isDraftReady: action.payload };
    case examAttemptActions.SET_IS_LOADING:
      return { ...state, isLoading: action.payload };
    case examAttemptActions.SET_IS_SUBMIT_CONFIRM_OPEN:
      return { ...state, isSubmitConfirmOpen: action.payload };
    case examAttemptActions.SET_IS_SUBMITTING:
      return { ...state, isSubmitting: action.payload };
    case examAttemptActions.SET_QUESTIONS:
      return { ...state, questions: action.payload };
    case examAttemptActions.SET_SELECTED_ANSWERS:
      return {
        ...state,
        selectedAnswers: resolveReducerValue(
          action.payload,
          state.selectedAnswers
        ),
      };
    case examAttemptActions.SET_START_TIME:
      return { ...state, startTime: action.payload };
    case examAttemptActions.SET_SUBJECT_NAME:
      return { ...state, subjectName: action.payload };
    case examAttemptActions.SET_TIME_LEFT:
      return {
        ...state,
        timeLeft: resolveReducerValue(action.payload, state.timeLeft),
      };
    case examAttemptActions.SET_TITLE:
      return { ...state, title: action.payload };
    case examAttemptActions.SET_USER_EXAM_ID:
      return { ...state, userExamId: action.payload };
    default:
      return state;
  }
};
