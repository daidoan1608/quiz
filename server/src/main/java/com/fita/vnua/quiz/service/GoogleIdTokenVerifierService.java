package com.fita.vnua.quiz.service;

public interface GoogleIdTokenVerifierService {

    boolean verify(String idToken);

    String extractEmail(String idToken) throws Exception;

    String extractName(String idToken) throws Exception;

    String extractPicture(String idToken) throws Exception;
}
