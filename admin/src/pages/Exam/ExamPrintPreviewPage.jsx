import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  App as AntApp,
  Card,
  Segmented,
  Skeleton,
  Space,
  Tag,
  Typography,
} from "antd";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/axiosConfig";
import { examApi } from "../../api/services";
import { AdminExportButton } from "../../components/common/buttons/AdminButtons";
import MainBackButton from "../../components/common/MainBackButton";
import MarkdownLatex from "../../components/common/MarkdownLatex";
import { typesetMath } from "../../utils/typesetMath";

const { Text, Title } = Typography;
const ANSWER_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

const sanitizeFileName = (value) =>
  (value || "de-thi")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

const getCorrectAnswerText = (question) =>
  (question.answers || [])
    .map((answer, index) => (answer.isCorrect ? ANSWER_LABELS[index] : null))
    .filter(Boolean)
    .join(", ");

const ExamPrintPreviewPage = () => {
  const { examId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [examDetail, setExamDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const { message } = AntApp.useApp();
  const paperRef = useRef(null);
  const navigate = useNavigate();
  const mode = searchParams.get("mode") === "answer" ? "answer" : "student";
  const questions = examDetail?.questions || [];
  const examHeading = examDetail?.title || "";

  const fileName = useMemo(() => {
    const prefix = examDetail?.examCode || `exam-${examId}`;
    const title = examDetail?.title || "de-thi";
    return `${sanitizeFileName(prefix)}-${sanitizeFileName(title)}-${mode}.pdf`;
  }, [examDetail, examId, mode]);

  const fetchExamDetail = useCallback(async () => {
    setLoading(true);
    try {
      setExamDetail(await examApi.getDetail(examId));
    } catch (error) {
      message.error(getApiErrorMessage(error, "Không thể tải đề thi để preview."));
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    fetchExamDetail();
  }, [fetchExamDetail]);

  useEffect(() => {
    if (paperRef.current) {
      typesetMath(paperRef.current);
    }
  }, [examDetail, mode]);

  const changeMode = (nextMode) => {
    setSearchParams({ mode: nextMode });
  };

  const handleExportPdf = async () => {
    if (!paperRef.current) return;

    setExporting(true);
    try {
      await typesetMath(paperRef.current);
      document.title = fileName.replace(/\.pdf$/, "");
      window.print();
    } catch (error) {
      message.error("Không thể mở hộp thoại export PDF. Vui lòng thử lại sau.");
    } finally {
      window.setTimeout(() => setExporting(false), 300);
    }
  };

  const answerData = questions.map((question, index) => ({
    key: question.questionId || index,
    index: index + 1,
    answer: getCorrectAnswerText(question) || "-",
  }));

  return (
    <div className="exam-print-preview-page">
      <MainBackButton onClick={() => navigate("/exams")} style={{ top: 96 }} />

      <Card className="exam-print-toolbar" variant="borderless">
        <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
          <Space wrap>
            <Segmented
              value={mode}
              onChange={changeMode}
              options={[
                { label: "Student", value: "student" },
                { label: "Answer", value: "answer" },
              ]}
            />
          </Space>
          <Space wrap>
            <AdminExportButton
              loading={exporting}
              onClick={handleExportPdf}
              disabled={loading || !examDetail}
            >
              Export PDF
            </AdminExportButton>
          </Space>
        </Space>
      </Card>

      {loading ? (
        <Card className="exam-print-toolbar" variant="borderless">
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      ) : examDetail ? (
        <main ref={paperRef} className="exam-print-paper">
          <header className="exam-print-header">
            <Title
              level={3}
              className="exam-print-title"
            >
              {examHeading}
            </Title>
            <Text className="exam-print-subtitle">
              {mode === "answer" ? "BẢN ĐỀ THI KÈM ĐÁP ÁN" : "ĐỀ THI"}
            </Text>
          </header>

          <section className="exam-print-meta">
            <div><strong>Mã đề:</strong> {examDetail.examCode || examDetail.examId}</div>
            <div><strong>Môn học:</strong> {examDetail.subjectName || examDetail.subjectId || "-"}</div>
            <div><strong>Thời gian:</strong> {examDetail.duration} phút</div>
            <div><strong>Số câu:</strong> {questions.length}</div>
          </section>

          {examDetail.description ? (
            <section className="exam-print-description">
              <strong>Ghi chú:</strong> <MarkdownLatex content={examDetail.description} as="span" />
            </section>
          ) : null}

          <section>
            {questions.map((question, questionIndex) => (
              <article className="exam-print-question" key={question.questionId || questionIndex}>
                <span className="exam-print-question-title">
                  Câu {questionIndex + 1}:
                </span>
                <MarkdownLatex
                  content={question.content}
                  as="span"
                  className="exam-print-question-content"
                />
                {question.imageUrl ? (
                  <img className="exam-print-image" src={question.imageUrl} alt={`Câu ${questionIndex + 1}`} />
                ) : null}
                <div>
                  {(question.answers || []).map((answer, answerIndex) => (
                    <div className="exam-print-answer" key={answer.optionId || answerIndex}>
                      <strong>{ANSWER_LABELS[answerIndex]}.</strong>
                      <MarkdownLatex content={answer.content} />
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </section>

          {mode === "answer" ? (
            <section className="exam-print-answer-key">
              <Title level={4} className="exam-print-answer-key-title">
                Bảng đáp án
              </Title>
              <table>
                <thead>
                  <tr>
                    <th>Câu</th>
                    <th>Đáp án đúng</th>
                  </tr>
                </thead>
                <tbody>
                  {answerData.map((item) => (
                    <tr key={item.key}>
                      <td>{item.index}</td>
                      <td>{item.answer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}
        </main>
      ) : (
        <Card className="exam-print-toolbar" variant="borderless">
          <Tag color="red">Không có dữ liệu đề thi để preview.</Tag>
        </Card>
      )}
    </div>
  );
};

export default ExamPrintPreviewPage;
