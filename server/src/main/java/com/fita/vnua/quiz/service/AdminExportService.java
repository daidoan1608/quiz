package com.fita.vnua.quiz.service;

public interface AdminExportService {

    byte[] exportUsersCsv();

    byte[] exportExamResultsCsv();

    byte[] exportQuestionsCsv();
}
