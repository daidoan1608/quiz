import React from "react";
import { Button, Checkbox, Form, Radio, Space, Tooltip, Typography, theme } from "antd";
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
  const { token } = theme.useToken();
  const answerCount = Form.useWatch("answers")?.length || QUESTION_MIN_ANSWERS;

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
        <Radio value={index} style={{ marginRight: 16, marginTop: 6 }}>
          <Text strong style={isCorrect ? correctLabelStyle : undefined}>
            Đáp án {label} {isCorrect && "(Đúng)"}
          </Text>
        </Radio>
      );
    }

    return (
      <div style={{ marginRight: 16, width: 120, paddingTop: 6 }}>
        <Checkbox
          checked={isCorrect}
          onChange={(event) => toggleMultipleAnswer(index, event.target.checked)}
        >
          <Text strong style={isCorrect ? correctLabelStyle : undefined}>
            Đáp án {label} {isCorrect && "(Đúng)"}
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
          <div
            key={field.key}
            style={{ display: "flex", alignItems: "flex-start", marginBottom: 16 }}
          >
            {renderSelector(index, label)}
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <Form.Item
                name={[field.name, "content"]}
                rules={[
                  {
                    required: true,
                    whitespace: true,
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
                style={{ marginLeft: 8, marginTop: 4 }}
              />
            </Tooltip>
          </div>
        );
      })}

      <Space style={{ marginBottom: 16 }}>
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
            onChange={(event) => setCorrectAnswers([event.target.value])}
            value={correctAnswers[0]}
            style={{ width: "100%" }}
          >
            {renderFields(fields, operations)}
          </Radio.Group>
        ) : (
          <div style={{ width: "100%" }}>{renderFields(fields, operations)}</div>
        )
      }
    </Form.List>
  );
};
