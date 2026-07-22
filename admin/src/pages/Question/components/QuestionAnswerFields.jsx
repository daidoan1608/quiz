import React from "react";
import { Button, Checkbox, Form, Radio, Space, Tooltip, Typography } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import MarkdownLatexEditor from "../../../components/common/MarkdownLatexEditor";
import {
  QUESTION_ANSWER_LABELS,
  QUESTION_MAX_ANSWERS,
  QUESTION_MIN_ANSWERS,
} from "../constants";

const { Text } = Typography;

export const QuestionAnswerFields = ({
  questionType,
  correctAnswers,
  setCorrectAnswers,
  requiredMessage,
  correctColor,
}) => {
  const answerCount = Form.useWatch("answers")?.length || QUESTION_MIN_ANSWERS;

  const correctColorStyle = correctColor
    ? { "--question-answer-correct-color": correctColor }
    : undefined;

  const toggleMultipleAnswer = (index, checked) => {
    if (checked) {
      setCorrectAnswers([...new Set([...correctAnswers, index])]);
      return;
    }
    setCorrectAnswers(correctAnswers.filter((item) => item !== index));
  };

  const removeCorrectAnswerAt = (removedIndex) => {
    setCorrectAnswers(
      correctAnswers
        .filter((index) => index !== removedIndex)
        .map((index) => (index > removedIndex ? index - 1 : index))
    );
  };

  const renderSelector = (index, label) => {
    const isCorrect = correctAnswers.includes(index);
    if (questionType === "SINGLE_CHOICE") {
      return (
        <Radio className="question-answer-selector" value={index}>
          <Text
            className={isCorrect ? "question-answer-label is-correct" : "question-answer-label"}
            strong
            style={isCorrect ? correctColorStyle : undefined}
          >
            Đáp án {label}
          </Text>
        </Radio>
      );
    }

    return (
      <div className="question-answer-checkbox-selector">
        <Checkbox
          checked={isCorrect}
          onChange={(event) => toggleMultipleAnswer(index, event.target.checked)}
        >
          <Text
            className={isCorrect ? "question-answer-label is-correct" : "question-answer-label"}
            strong
            style={isCorrect ? correctColorStyle : undefined}
          >
            Đáp án {label}
          </Text>
        </Checkbox>
      </div>
    );
  };

  const renderFields = (fields, { add, remove }) => (
    <>
      {fields.map((field, index) => {
        const label = QUESTION_ANSWER_LABELS[index];
        const isCorrect = correctAnswers.includes(index);

        return (
          <div className="question-answer-row" key={field.key}>
            {renderSelector(index, label)}
            <div className="question-answer-editor">
              <Form.Item
                name={[field.name, "content"]}
                rules={[
                  {
                    required: true,
                    whitespace: true,
                    message: requiredMessage?.(label) || "Không được để trống!",
                  },
                ]}
                className="question-answer-form-item"
              >
                <MarkdownLatexEditor
                  className={
                    isCorrect
                      ? "question-answer-input is-correct"
                      : "question-answer-input"
                  }
                  placeholder={`Nhập đáp án ${label} (hỗ trợ Markdown và LaTeX)`}
                  minRows={2}
                  maxRows={6}
                  compact
                  style={isCorrect ? correctColorStyle : undefined}
                />
              </Form.Item>
            </div>
            <Tooltip title="Xóa đáp án">
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                disabled={fields.length <= QUESTION_MIN_ANSWERS}
                onClick={() => {
                  remove(field.name);
                  removeCorrectAnswerAt(index);
                }}
                className="question-answer-remove"
              />
            </Tooltip>
          </div>
        );
      })}

      <Space className="question-answer-add-row">
        <Button
          icon={<PlusOutlined />}
          onClick={() => add({ content: "" })}
          disabled={answerCount >= QUESTION_MAX_ANSWERS}
        >
          Thêm đáp án
        </Button>
        <Text type="secondary">
          {answerCount}/{QUESTION_MAX_ANSWERS} đáp án
        </Text>
      </Space>
    </>
  );

  return (
    <Form.List name="answers">
      {(fields, operations) =>
        questionType === "SINGLE_CHOICE" ? (
          <Radio.Group
            className="question-answer-group"
            onChange={(event) => setCorrectAnswers([event.target.value])}
            value={correctAnswers[0]}
          >
            {renderFields(fields, operations)}
          </Radio.Group>
        ) : (
          <div className="question-answer-group">{renderFields(fields, operations)}</div>
        )
      }
    </Form.List>
  );
};
