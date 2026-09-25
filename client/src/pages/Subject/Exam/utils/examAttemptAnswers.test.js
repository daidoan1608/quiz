import { describe, expect, it } from 'vitest';
import {
  buildSaveAnswerPayload,
  mapAttemptAnswersToSelection,
} from './examAttemptAnswers';

describe('examAttemptAnswers', () => {
  const sampleQuestions = [
    {
      questionId: 101,
      questionType: 'SINGLE_CHOICE',
      answers: [
        { optionId: 1, content: 'Option A' },
        { optionId: 2, content: 'Option B' },
      ],
    },
    {
      questionId: 102,
      questionType: 'MULTIPLE_CHOICE',
      answers: [
        { optionId: 3, content: 'Option C' },
        { optionId: 4, content: 'Option D' },
        { optionId: 5, content: 'Option E' },
      ],
    },
  ];

  describe('buildSaveAnswerPayload', () => {
    it('builds payload with answerId for single choice questions', () => {
      const payload = buildSaveAnswerPayload({
        answerValue: 1,
        question: sampleQuestions[0],
        questionIndex: 0,
        remainingTime: 300,
      });

      expect(payload).toEqual({
        answerId: 2,
        currentQuestionIndex: 0,
        questionId: 101,
        remainingTime: 300,
      });
      expect(payload.answerIds).toBeUndefined();
    });

    it('builds payload with answerIds for multiple choice questions', () => {
      const payload = buildSaveAnswerPayload({
        answerValue: [0, 2],
        question: sampleQuestions[1],
        questionIndex: 1,
        remainingTime: 250,
      });

      expect(payload).toEqual({
        answerIds: [3, 5],
        currentQuestionIndex: 1,
        questionId: 102,
        remainingTime: 250,
      });
      expect(payload.answerId).toBeUndefined();
    });
  });

  describe('mapAttemptAnswersToSelection', () => {
    it('correctly maps user answers back to selectedIndexes for both single and multiple choice', () => {
      const userAnswerDtos = [
        { questionId: 101, answerId: 2 },
        { questionId: 102, answerId: 3 },
        { questionId: 102, answerId: 5 },
      ];

      const selections = mapAttemptAnswersToSelection(sampleQuestions, userAnswerDtos);

      expect(selections).toEqual({
        0: 1,
        1: [0, 2],
      });
    });
  });
});
