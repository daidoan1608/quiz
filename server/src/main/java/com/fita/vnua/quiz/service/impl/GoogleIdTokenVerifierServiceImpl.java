package com.fita.vnua.quiz.service.impl;

import com.fita.vnua.quiz.service.GoogleIdTokenVerifierService;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.RSASSAVerifier;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;

import java.net.URL;
import java.security.interfaces.RSAPublicKey;
import java.util.Date;

@Service
public class GoogleIdTokenVerifierServiceImpl implements GoogleIdTokenVerifierService {

    @Value("${google.client.ids:${google.client.id}}")
    private String clientIds;

    @Value("${google.jwks-url}")
    private String googleJwksUrl;

    @Override
    public boolean verify(String idToken) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(idToken);
            String kid = signedJWT.getHeader().getKeyID();

            // lấy public key từ Google
            JWKSet jwkSet = JWKSet.load(new URL(googleJwksUrl));
            JWK jwk = jwkSet.getKeyByKeyId(kid);
            if (jwk == null) return false;

            RSAKey rsaKey = (RSAKey) jwk;
            RSAPublicKey publicKey = rsaKey.toRSAPublicKey();

            // verify chữ ký
            JWSVerifier verifier = new RSASSAVerifier(publicKey);
            if (!signedJWT.verify(verifier)) return false;

            // verify audience is one of configured Google OAuth client IDs
            java.util.List<String> audiences = signedJWT.getJWTClaimsSet().getAudience();
            boolean audienceAllowed = java.util.Arrays.stream(clientIds.split(","))
                    .map(String::trim)
                    .filter(id -> !id.isBlank())
                    .anyMatch(audiences::contains);
            if (!audienceAllowed) return false;

            // verify expiry
            if (signedJWT.getJWTClaimsSet().getExpirationTime().before(new Date())) return false;

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public String extractEmail(String idToken) throws Exception {
        return SignedJWT.parse(idToken).getJWTClaimsSet().getStringClaim("email");
    }

    @Override
    public String extractName(String idToken) throws Exception {
        return SignedJWT.parse(idToken).getJWTClaimsSet().getStringClaim("name");
    }

    @Override
    public String extractPicture(String idToken) throws Exception {
        return SignedJWT.parse(idToken).getJWTClaimsSet().getStringClaim("picture");
    }
}
