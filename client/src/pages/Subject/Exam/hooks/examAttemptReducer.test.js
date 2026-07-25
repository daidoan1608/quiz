import { describe, expect, it } from 'vitest';
import {
  createInitialExamAttemptState,
  examAttemptActions,
  examAttemptReducer,
} from './examAttemptReducer';

describe('examAttemptReducer', () => {
  it('updates simple scalar fields', () => {
    const initialState = createInitialExamAttemptState();

    const withDuration = examAttemptReducer(initialState, {
      type: examAttemptActions.SET_DURATION,
      payload: 45,
    });
    const withTitle = examAttemptReducer(withDuration, {
      type: examAttemptActions.SET_TITLE,
      payload: 'Kiểm tra chương 1',
    });

    expect(withTitle.duration).toBe(45);
    expect(withTitle.title).toBe('Kiểm tra chương 1');
  });

  it('supports functional updates for question index, answers, and time left', () => {
    const initialState = {
      ...createInitialExamAttemptState(),
      currentQuestionIndex: 1,
      selectedAnswers: { 0: 2 },
      timeLeft: 120,
    };

    const withNextQuestion = examAttemptReducer(initialState, {
      type: examAttemptActions.SET_CURRENT_QUESTION_INDEX,
      payload: (previous) => previous + 1,
    });
    const withNextAnswers = examAttemptReducer(withNextQuestion, {
      type: examAttemptActions.SET_SELECTED_ANSWERS,
      payload: (previous) => ({ ...previous, 1: 3 }),
    });
    const withNextTime = examAttemptReducer(withNextAnswers, {
      type: examAttemptActions.SET_TIME_LEFT,
      payload: (previous) => previous - 1,
    });

    expect(withNextTime.currentQuestionIndex).toBe(2);
    expect(withNextTime.selectedAnswers).toEqual({ 0: 2, 1: 3 });
    expect(withNextTime.timeLeft).toBe(119);
  });

  it('returns the same state object for unknown actions', () => {
    const initialState = createInitialExamAttemptState();

    const nextState = examAttemptReducer(initialState, {
      type: 'UNKNOWN_ACTION',
      payload: 'ignored',
    });

    expect(nextState).toBe(initialState);
  });
});
