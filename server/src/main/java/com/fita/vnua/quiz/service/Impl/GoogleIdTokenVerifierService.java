package com.fita.vnua.quiz.service.impl;

import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.RSASSAVerifier;
import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jwt.SignedJWT;
import org.springframework.stereotype.Service;

import java.net.URL;
import java.security.interfaces.RSAPublicKey;
import java.util.Date;

@Service
public class GoogleIdTokenVerifierService {
    private static final String GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
    private static final String CLIENT_ID = "995894234177-g23jtl5nkhpj0qon3b7q4kngbjvgb38g.apps.googleusercontent.com";

    public boolean verify(String idToken) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(idToken);
            String kid = signedJWT.getHeader().getKeyID();

            // lấy public key từ Google
            JWKSet jwkSet = JWKSet.load(new URL(GOOGLE_JWKS_URL));
            JWK jwk = jwkSet.getKeyByKeyId(kid);
            if (jwk == null) return false;

            RSAKey rsaKey = (RSAKey) jwk;
            RSAPublicKey publicKey = rsaKey.toRSAPublicKey();

            // verify chữ ký
            JWSVerifier verifier = new RSASSAVerifier(publicKey);
            if (!signedJWT.verify(verifier)) return false;

            // verify audience = client id
            if (!signedJWT.getJWTClaimsSet().getAudience().contains(CLIENT_ID)) return false;

            // verify expiry
            if (signedJWT.getJWTClaimsSet().getExpirationTime().before(new Date())) return false;

            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public String extractEmail(String idToken) throws Exception {
        return SignedJWT.parse(idToken).getJWTClaimsSet().getStringClaim("email");
    }

    public String extractName(String idToken) throws Exception {
        return SignedJWT.parse(idToken).getJWTClaimsSet().getStringClaim("name");
    }
}
