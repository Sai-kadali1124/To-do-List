/**
 * SentinelGuard Form & Credential Shield
 * Protects login forms, warns on insecure password submissions,
 * and intercepts clipboard hijacking of cryptocurrency addresses.
 */

(function () {
  let lastCopiedAddress = "";
  const CRYPTO_REGEX = /\b(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-z0-9]{39,59}|0x[a-fA-F0-9]{40})\b/;

  // Clipboard hijacking detector
  document.addEventListener("copy", () => {
    navigator.clipboard.readText().then(text => {
      if (CRYPTO_REGEX.test(text.trim())) {
        lastCopiedAddress = text.trim();
      }
    }).catch(() => {});
  });

  document.addEventListener("paste", (e) => {
    const pasted = (e.clipboardData || window.clipboardData).getData("text").trim();
    if (CRYPTO_REGEX.test(pasted) && lastCopiedAddress && pasted !== lastCopiedAddress) {
      // Possible clipboard address replacement by stealer malware
      alert(
        "⚠️ [SentinelGuard Security Warning]\n\n" +
        "Clipboard Tampering Detected!\n" +
        "The crypto address you just pasted does NOT match the address you copied.\n\n" +
        "Copied: " + lastCopiedAddress.substring(0, 10) + "...\n" +
        "Pasted: " + pasted.substring(0, 10) + "...\n\n" +
        "Malware may be trying to divert your funds to an attacker's wallet. Please verify carefully!"
      );
    }
  });

  // Insecure Password Entry Warning
  function checkPasswordInputs() {
    if (window.location.protocol === "http:" && window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
      const pwFields = document.querySelectorAll("input[type='password']");
      if (pwFields.length > 0) {
        pwFields.forEach(field => {
          field.addEventListener("focus", () => {
            SentinelUI.renderWarningBanner({
              reason: "This site uses an unencrypted (HTTP) connection. Passwords entered here can be intercepted by anyone on your network."
            });
          }, { once: true });
        });
      }
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkPasswordInputs);
  } else {
    checkPasswordInputs();
  }
})();
