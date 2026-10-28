import { describe, it } from "node:test";
import assert from "node:assert/strict";

import {
  collectNonNegativeNumberErrors,
  collectOpeningsCountErrors,
  collectStrictlyPositiveNumberErrors
} from "../src/utils/nonNegativeNumericValidation.js";

describe("frontend non-negative numeric validation", () => {
  it("rejects negative offer CTC values", () => {
    const errors = collectStrictlyPositiveNumberErrors("offered_ctc", -100, {
      label: "Offered CTC"
    });
    assert.match(errors[0], /greater than 0/i);
  });

  it("rejects negative optional commercial amounts", () => {
    const errors = collectNonNegativeNumberErrors("variable_pay", -1, {
      label: "Variable pay",
      allowBlank: true
    });
    assert.match(errors[0], /cannot be negative/i);
  });

  it("rejects negative openings counts", () => {
    assert.ok(
      collectOpeningsCountErrors(-2).some((message) =>
        /whole number of at least 1/i.test(message)
      )
    );
  });

  it("allows zero for optional non-negative amounts", () => {
    assert.deepEqual(
      collectNonNegativeNumberErrors("variable_pay", 0, {
        label: "Variable pay",
        allowBlank: true
      }),
      []
    );
  });

  it("validates optional counter CTC amounts", () => {
    const validateOptionalCounterCtc = (rawValue) => {
      if (rawValue === "" || rawValue === null || rawValue === undefined) {
        return "";
      }
      const errors = collectStrictlyPositiveNumberErrors("counter_ctc", rawValue, {
        label: "Counter CTC"
      });
      return errors[0] || "";
    };
    assert.equal(validateOptionalCounterCtc(""), "");
    assert.match(validateOptionalCounterCtc(-1), /greater than 0/i);
  });
});
