import React from "react";
import { Checkbox, Form, Radio, Typography, theme } from "antd";
import MarkdownLatexEditor from "../../../components/common/MarkdownLatexEditor";
import { QUESTION_ANSWER_LABELS } from "../constants";

const { Text } = Typography;

export const QuestionAnswerFields = ({
  questionType,
  correctAnswers,
  setCorrectAnswers,
  fieldNames,
  requiredMessage,
  correctColor,
}) => {
  const { token } = theme.useToken();

  const correctLabelStyle = {
    color: correctColor || token.colorSuccessText || token.colorSuccess,
  };

  const getAnswerInputStyle = (isCorrect) => ({
    borderColor: isCorrect
      ? token.colorSuccessBorder || token.colorSuccess || "var(--admin-success)"
      : undefined,
    backgroundColor:
      isCorrect && !correctColor
        ? token.colorSuccessBg || "rgba(34, 197, 94, 0.14)"
        : undefined,
    color: token.colorText,
  });

  const toggleMultipleAnswer = (index, checked) => {
    if (checked) {
      setCorrectAnswers([...correctAnswers, index]);
      return;
    }
    setCorrectAnswers(correctAnswers.filter((item) => item !== index));
  };

  const renderAnswerInput = (index) => {
    const label = QUESTION_ANSWER_LABELS[index];
    const isCorrect = correctAnswers.includes(index);

    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Form.Item
          name={fieldNames[index]}
          rules={[
            {
              required: true,
              message: requiredMessage?.(label) || "Không được để trống!",
            },
          ]}
          style={{ margin: 0 }}
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
            style={getAnswerInputStyle(isCorrect)}
          />
        </Form.Item>
      </div>
    );
  };

  if (questionType === "SINGLE_CHOICE") {
    return (
      <Radio.Group
        onChange={(event) => setCorrectAnswers([event.target.value])}
        value={correctAnswers[0]}
        style={{ width: "100%" }}
      >
        {QUESTION_ANSWER_LABELS.map((label, index) => (
          <div
            key={label}
            style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}
          >
            <Radio value={index} style={{ marginRight: 16, marginTop: 6 }}>
              <Text strong style={correctAnswers.includes(index) ? correctLabelStyle : undefined}>
                Đáp án {label} {correctAnswers.includes(index) && "(Đúng)"}
              </Text>
            </Radio>
            {renderAnswerInput(index)}
          </div>
        ))}
      </Radio.Group>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      {QUESTION_ANSWER_LABELS.map((label, index) => {
        const isChecked = correctAnswers.includes(index);
        return (
          <div
            key={label}
            style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}
          >
            <div style={{ marginRight: 16, width: 120, paddingTop: 6 }}>
              <Checkbox
                checked={isChecked}
                onChange={(event) => toggleMultipleAnswer(index, event.target.checked)}
              >
                <Text strong style={isChecked ? correctLabelStyle : undefined}>
                  Đáp án {label} {isChecked && "(Đúng)"}
                </Text>
              </Checkbox>
            </div>
            {renderAnswerInput(index)}
          </div>
        );
      })}
    </div>
  );
};
