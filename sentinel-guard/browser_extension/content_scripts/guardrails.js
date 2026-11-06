/**
 * SentinelGuard Transaction Guardrails
 * Intercepts financial transfer submissions to prevent scam-induced payments.
 * Stops transactions when remote-access tools are active or when abnormal payee patterns appear.
 */

(function () {
  function findTransferData(form) {
    let amount = 0;
    let payee = "";
    let isNewPayee = false;

    const inputs = form.querySelectorAll("input, select, textarea");
    inputs.forEach(input => {
      const name = (input.name || input.id || input.placeholder || "").toLowerCase();
      const val = input.value.trim();

      // Check amount
      if (name.includes("amount") || name.includes("sum") || name.includes("total") || name.includes("value")) {
        const parsed = parseFloat(val.replace(/[^0-9.]/g, ""));
        if (!isNaN(parsed) && parsed > amount) {
          amount = parsed;
        }
      }

      // Check payee
      if (name.includes("payee") || name.includes("recipient") || name.includes("beneficiary") || name.includes("receiver") || name.includes("to")) {
        if (val && !payee) {
          payee = val;
        }
      }

      // Check new payee indicators
      if (name.includes("new") || input.getAttribute("data-new-payee") === "true") {
        isNewPayee = true;
      }
    });

    return { amount, payee: payee || "Recipient", isNewPayee };
  }

  function attachFormInterceptor() {
    document.addEventListener("submit", function (e) {
      const form = e.target;
      if (!form || form.tagName !== "FORM") return;

      // Check if form is a financial transfer form
      const { amount, payee, isNewPayee } = findTransferData(form);
      if (amount <= 0 && !form.getAttribute("data-sentinel-guard")) {
        // Not a financial transfer or amount is 0
        return;
      }

      // If already verified and approved by user, proceed
      if (form.getAttribute("data-sentinel-approved") === "true") {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      const txPayload = {
        domain: window.location.hostname,
        amount: amount || 500.0,
        payee_name: payee,
        is_new_payee: isNewPayee,
        currency: "USD"
      };

      chrome.runtime.sendMessage({
        type: "CHECK_TRANSACTION",
        data: txPayload
      }, (response) => {
        if (!response || response.verdict === "ALLOW") {
          // Clear to proceed
          form.setAttribute("data-sentinel-approved", "true");
          form.submit();
        } else {
          // Intercept and prompt user with Guardrail Modal
          SentinelUI.renderGuardrailModal(
            response,
            // onConfirm
            () => {
              form.setAttribute("data-sentinel-approved", "true");
              form.submit();
            },
            // onCancel
            () => {
              console.log("[SentinelGuard] Transaction cancelled by user.");
            }
          );
        }
      });
    }, true);
  }

  // Monitor DOM for dynamic forms
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", attachFormInterceptor);
  } else {
    attachFormInterceptor();
  }
})();
