/**
 * Global setup for test environment.
 * Sets up jQuery mock for bootstrap plugins that require it at load time.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
const jQueryMock: any = function (selector: any) {
  return {
    each: jest.fn().mockReturnThis(),
    on: jest.fn().mockReturnThis(),
    off: jest.fn().mockReturnThis(),
    trigger: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
    data: jest.fn().mockReturnValue({}),
    attr: jest.fn().mockReturnThis(),
    val: jest.fn().mockReturnValue(''),
    html: jest.fn().mockReturnThis(),
    text: jest.fn().mockReturnValue(''),
    addClass: jest.fn().mockReturnThis(),
    removeClass: jest.fn().mockReturnThis(),
    hasClass: jest.fn().mockReturnValue(false),
    css: jest.fn().mockReturnThis(),
    show: jest.fn().mockReturnThis(),
    hide: jest.fn().mockReturnThis(),
    remove: jest.fn().mockReturnThis(),
    append: jest.fn().mockReturnThis(),
    prepend: jest.fn().mockReturnThis(),
    parent: jest.fn().mockReturnThis(),
    children: jest.fn().mockReturnThis(),
    closest: jest.fn().mockReturnThis(),
    popover: jest.fn().mockReturnThis(),
    datetimepicker: jest.fn().mockReturnThis(),
    datepicker: jest.fn().mockReturnThis(),
    0: selector,
    length: 1,
  };
};
/* eslint-enable @typescript-eslint/no-explicit-any */

jQueryMock.fn = {
  extend: jest.fn(),
  datepicker: jest.fn(),
  datetimepicker: jest.fn(),
};
jQueryMock.extend = jest.fn();
jQueryMock.isPlainObject = (obj: unknown) =>
  typeof obj === 'object' && obj !== null;
jQueryMock.isEmptyObject = (obj: unknown) =>
  typeof obj === 'object' && obj !== null && Object.keys(obj).length === 0;
jQueryMock.isArray = Array.isArray;
jQueryMock.trim = (str: string) => str.trim();
jQueryMock.each = jest.fn();
jQueryMock.event = { special: {} };

// Set jQuery as global for bootstrap plugins
(global as Record<string, unknown>).$ = jQueryMock;
(global as Record<string, unknown>).jQuery = jQueryMock;
(window as unknown as Record<string, unknown>).$ = jQueryMock;
(window as unknown as Record<string, unknown>).jQuery = jQueryMock;
