// Mock jQuery for test environment
const jQueryMock = function () {
  return jQueryMock;
};

jQueryMock.fn = {
  datepicker: function () {
    return this;
  },
  datetimepicker: function () {
    return this;
  },
  extend: function () {},
};

jQueryMock.extend = function () {};
jQueryMock.each = function () {};
jQueryMock.data = function () {
  return {};
};

module.exports = jQueryMock;
module.exports.default = jQueryMock;
