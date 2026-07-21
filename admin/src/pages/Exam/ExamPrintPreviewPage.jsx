import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Button,
  Card,
  Segmented,
  Skeleton,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  PrinterOutlined,
} from "@ant-design/icons";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getApiErrorMessage } from "../../api/axiosConfig";
import { examApi } from "../../api/services";
import MarkdownLatex from "../../components/common/MarkdownLatex";
import { typesetMath } from "../../utils/typesetMath";

const { Text, Title } = Typography;
const ANSWER_LABELS = ["A", "B", "C", "D"];

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
  const paperRef = useRef(null);
  const navigate = useNavigate();
  const mode = searchParams.get("mode") === "answer" ? "answer" : "student";
  const questions = examDetail?.questions || [];

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

  const handlePrint = () => {
    document.title = fileName.replace(/\.pdf$/, "");
    window.print();
  };

  const handleExportPdf = async () => {
    if (!paperRef.current) return;

    setExporting(true);
    try {
      await typesetMath(paperRef.current);
      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);
      const canvas = await html2canvas(paperRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
        allowTaint: true,
      });
      const imageData = canvas.toDataURL("image/jpeg", 0.98);
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imageHeight = (canvas.height * pageWidth) / canvas.width;
      let remainingHeight = imageHeight;
      let y = 0;

      pdf.addImage(imageData, "JPEG", 0, y, pageWidth, imageHeight);
      remainingHeight -= pageHeight;

      while (remainingHeight > 0) {
        y -= pageHeight;
        pdf.addPage();
        pdf.addImage(imageData, "JPEG", 0, y, pageWidth, imageHeight);
        remainingHeight -= pageHeight;
      }

      pdf.save(fileName);
    } catch (error) {
      message.error("Không thể export PDF. Bạn có thể dùng nút Print và chọn Save as PDF.");
    } finally {
      setExporting(false);
    }
  };

  const answerColumns = [
    {
      title: "Câu",
      dataIndex: "index",
      key: "index",
      width: 80,
    },
    {
      title: "Đáp án",
      dataIndex: "answer",
      key: "answer",
    },
  ];

  const answerData = questions.map((question, index) => ({
    key: question.questionId || index,
    index: index + 1,
    answer: getCorrectAnswerText(question) || "-",
  }));

  return (
    <div className="exam-print-preview-page">
      <style>
        {`
          .exam-print-preview-page {
            min-height: 100vh;
            background: #eef1f5;
            padding: 24px;
          }
          .exam-print-toolbar {
            max-width: 210mm;
            margin: 0 auto 16px;
          }
          .exam-print-paper {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 18mm 16mm;
            background: #fff;
            color: #111827;
            box-shadow: 0 12px 36px rgba(15, 23, 42, 0.18);
            font-family: "Times New Roman", serif;
            font-size: 13pt;
            line-height: 1.5;
          }
          .exam-print-header {
            text-align: center;
            border-bottom: 1px solid #111827;
            padding-bottom: 12px;
            margin-bottom: 18px;
          }
          .exam-print-meta {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 8px 24px;
            margin: 12px 0 18px;
            font-size: 12pt;
          }
          .exam-print-question {
            break-inside: avoid;
            page-break-inside: avoid;
            margin-bottom: 16px;
          }
          .exam-print-question-title {
            font-weight: 700;
            margin-bottom: 6px;
          }
          .exam-print-answer {
            display: grid;
            grid-template-columns: 24px minmax(0, 1fr);
            gap: 6px;
            margin: 4px 0 4px 18px;
          }
          .exam-print-answer-key {
            margin-top: 24px;
            break-inside: avoid;
            page-break-inside: avoid;
          }
          .exam-print-image {
            display: block;
            max-width: 100%;
            max-height: 90mm;
            object-fit: contain;
            margin: 8px auto;
          }
          @media print {
            @page { size: A4; margin: 0; }
            body { background: #fff !important; }
            body * { visibility: hidden; }
            .exam-print-paper, .exam-print-paper * { visibility: visible; }
            .exam-print-paper {
              position: absolute;
              left: 0;
              top: 0;
              width: 210mm;
              min-height: 297mm;
              padding: 18mm 16mm;
              margin: 0;
              box-shadow: none;
            }
            .exam-print-toolbar { display: none !important; }
          }
        `}
      </style>

      <Card className="exam-print-toolbar" bordered={false}>
        <Space wrap style={{ width: "100%", justifyContent: "space-between" }}>
          <Space wrap>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/exams")}>
              Quay lại
            </Button>
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
            <Button icon={<PrinterOutlined />} onClick={handlePrint} disabled={loading || !examDetail}>
              Print
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              loading={exporting}
              onClick={handleExportPdf}
              disabled={loading || !examDetail}
            >
              Export PDF
            </Button>
          </Space>
        </Space>
      </Card>

      {loading ? (
        <Card className="exam-print-toolbar" bordered={false}>
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      ) : examDetail ? (
        <main ref={paperRef} className="exam-print-paper">
          <header className="exam-print-header">
            <Title level={3} style={{ margin: 0, fontFamily: "inherit" }}>
              {examDetail.title}
            </Title>
            <Text>{mode === "answer" ? "BẢN ĐỀ THI KÈM ĐÁP ÁN" : "ĐỀ THI"}</Text>
          </header>

          <section className="exam-print-meta">
            <div><strong>Mã đề:</strong> {examDetail.examCode || examDetail.examId}</div>
            <div><strong>Môn học:</strong> {examDetail.subjectName || examDetail.subjectId || "-"}</div>
            <div><strong>Thời gian:</strong> {examDetail.duration} phút</div>
            <div><strong>Số câu:</strong> {questions.length}</div>
          </section>

          {examDetail.description ? (
            <section style={{ marginBottom: 18 }}>
              <strong>Ghi chú:</strong> <MarkdownLatex content={examDetail.description} as="span" />
            </section>
          ) : null}

          <section>
            {questions.map((question, questionIndex) => (
              <article className="exam-print-question" key={question.questionId || questionIndex}>
                <div className="exam-print-question-title">
                  Câu {questionIndex + 1}.
                </div>
                <MarkdownLatex content={question.content} />
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
              <Title level={4} style={{ fontFamily: "inherit" }}>
                Bảng đáp án
              </Title>
              <Table
                columns={answerColumns}
                dataSource={answerData}
                pagination={false}
                size="small"
                bordered
              />
            </section>
          ) : null}
        </main>
      ) : (
        <Card className="exam-print-toolbar" bordered={false}>
          <Tag color="red">Không có dữ liệu đề thi để preview.</Tag>
        </Card>
      )}
    </div>
  );
};

export default ExamPrintPreviewPage;
