package com.fita.vnua.quiz.service.storage.impl;

import com.fita.vnua.quiz.service.storage.ImageStorage;
import com.fita.vnua.quiz.service.storage.StoredImage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.Locale;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;

@Service
@Primary
@ConditionalOnProperty(name = {"cloudinary.enabled", "imgbb.enabled"}, havingValue = "true")
@Slf4j
public class CompositeImageStorage implements ImageStorage {

    private final CloudinaryImageStorage cloudinaryImageStorage;
    private final ImgBbImageStorage imgBbImageStorage;
    private final String primaryProvider;

    public CompositeImageStorage(
            CloudinaryImageStorage cloudinaryImageStorage,
            ImgBbImageStorage imgBbImageStorage,
            @Value("${image.storage.primary:cloudinary}") String primaryProvider
    ) {
        this.cloudinaryImageStorage = cloudinaryImageStorage;
        this.imgBbImageStorage = imgBbImageStorage;
        this.primaryProvider = primaryProvider == null ? "cloudinary" : primaryProvider.toLowerCase(Locale.ROOT);
    }

    @Override
    public StoredImage save(String directory, String publicPathPrefix, String filename, byte[] bytes) throws Exception {
        boolean imgBbPrimary = "imgbb".equals(primaryProvider);
        CompletableFuture<StoredImage> cloudinaryUpload = uploadAsync(
                "Cloudinary",
                () -> cloudinaryImageStorage.save(directory, publicPathPrefix, filename, bytes)
        );
        CompletableFuture<StoredImage> imgBbUpload = uploadAsync(
                "ImgBB",
                () -> imgBbImageStorage.save(directory, publicPathPrefix, filename, bytes)
        );

        StoredImage primary = awaitUpload(imgBbPrimary ? imgBbUpload : cloudinaryUpload);
        StoredImage secondary = awaitUpload(imgBbPrimary ? cloudinaryUpload : imgBbUpload);

        if (primary != null) {
            return primary;
        }
        if (secondary != null) {
            return secondary;
        }

        throw new IllegalStateException("Image upload failed on both Cloudinary and ImgBB");
    }

    @Override
    public void delete(String directory, String publicPathPrefix, String url) throws Exception {
        CompletableFuture<Void> cloudinaryDelete = deleteAsync(
                "Cloudinary",
                () -> cloudinaryImageStorage.delete(directory, publicPathPrefix, url)
        );
        CompletableFuture<Void> imgBbDelete = deleteAsync(
                "ImgBB",
                () -> imgBbImageStorage.delete(directory, publicPathPrefix, url)
        );

        awaitDelete(cloudinaryDelete);
        awaitDelete(imgBbDelete);
    }

    private CompletableFuture<StoredImage> uploadAsync(String provider, ThrowingSupplier<StoredImage> supplier) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                return supplier.get();
            } catch (Exception e) {
                log.warn("{} image upload failed", provider, e);
                throw new CompletionException(e);
            }
        });
    }

    private StoredImage awaitUpload(CompletableFuture<StoredImage> upload) {
        try {
            return upload.join();
        } catch (CompletionException e) {
            return null;
        }
    }

    private CompletableFuture<Void> deleteAsync(String provider, ThrowingRunnable runnable) {
        return CompletableFuture.runAsync(() -> {
            try {
                runnable.run();
            } catch (Exception e) {
                log.warn("{} image delete failed", provider, e);
                throw new CompletionException(e);
            }
        });
    }

    private void awaitDelete(CompletableFuture<Void> delete) {
        try {
            delete.join();
        } catch (CompletionException ignored) {
            // Delete failures are already logged per provider.
        }
    }

    @FunctionalInterface
    private interface ThrowingSupplier<T> {
        T get() throws Exception;
    }

    @FunctionalInterface
    private interface ThrowingRunnable {
        void run() throws Exception;
    }
}
