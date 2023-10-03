var _formatUID = (number) => {
  const paddedNumber = String(number).padStart(6, '0');
  return `UID${paddedNumber}`;
}

var _formatMID = (number) => {
  const paddedNumber = String(number).padStart(6, '0');
  return `UID${paddedNumber}`;
}

exports.formatUID = _formatUID
exports.formatMID = _formatMID