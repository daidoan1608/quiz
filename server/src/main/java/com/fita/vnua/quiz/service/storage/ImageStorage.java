package com.fita.vnua.quiz.service.storage;

public interface ImageStorage {

    StoredImage save(String directory, String publicPathPrefix, String filename, byte[] bytes) throws Exception;

    void delete(String directory, String publicPathPrefix, String url) throws Exception;
}
