import { authAxios } from '../axiosConfig';
import { getResponseData } from './apiResponse';

export const aiApi = {
  explainQuestion(questionId, selectedAnswerIds = []) {
    return authAxios
      .post('ai/explain-question', {
        questionId,
        selectedAnswerIds,
      })
      .then((response) => getResponseData(response, null));
  },

  getLearningRoadmap(forceRefresh = false) {
    return authAxios
      .get('ai/roadmap', {
        params: { refresh: forceRefresh },
      })
      .then((response) => getResponseData(response, null));
  },

  analyzeExamResult(userExamId) {
    return authAxios
      .post('ai/analyze-exam-result', { userExamId })
      .then((response) => getResponseData(response, null));
  },
};
