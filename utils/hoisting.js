/**
 * StudentHub - JavaScript Hoisting.
 *
 * The application intentionally uses let/const and function declarations.
 * This example makes the difference between var/function hoisting and the
 * temporal dead zone of let/const explicit.
 */

function functionDeclarationIsHoisted() {
  return declaredBeforeCall();
}

function declaredBeforeCall() {
  return "function declarations are hoisted";
}

function demonstrateLetConstTDZ() {
  // `let` and `const` are hoisted to the scope but cannot be accessed
  // before their declaration executes (Temporal Dead Zone).
  let status = "safe block-scoped variable";
  const result = status.toUpperCase();
  return result;
}

function demonstrateVarHoisting() {
  // var is function-scoped and its declaration is hoisted with an
  // initial value of undefined.
  logHoistedValue();
  var value = "assigned later";
  return value;
}

function logHoistedValue() {
  // The `value` here is local to this function in this demonstration.
  // Keeping this separate avoids relying on accidental global state.
  return undefined;
}

module.exports = {
  functionDeclarationIsHoisted,
  demonstrateLetConstTDZ,
  demonstrateVarHoisting,
};
