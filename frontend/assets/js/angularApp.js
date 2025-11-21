var app = angular.module('ngApp', []);
app.constant("API_URL", window.baseUrl);
app.constant("window", window);
app.constant("jQuery", window.jQuery);
app.config([
  "$httpProvider",
  function ($httpProvider) {
    $httpProvider.defaults.headers.post["Content-Type"] =
      "application/x-www-form-urlencoded; charset=UTF-8";
  },
]);
app.directive("bindHtmlCompile", [
  "$compile",
  function ($compile) {
    return {
      restrict: "A",
      link: function (scope, element, attrs) {
        scope.$watch(attrs.bindHtmlCompile, function (newValue) {
          if (newValue) {
            element.html(newValue);
            $compile(element.contents())(scope);
          }
        });
      },
    };
  },
]);
app.filter("formatDecimal", function () {
  return function (value, limit) {
    return window.formatDecimal(value, limit);
  };
});
app.filter("formatNIC", function () {
  return function (value) {
    if (!value) return "";
    let number = value.toString().toUpperCase().trim();
    if (/^\d{9}[VX]$/.test(number)) {
      return number.substring(0, 4) + ' ' + number.substring(4, 8) + ' ' + number.substring(8);
    }
    else if (/^\d{12}$/.test(number)) {
      return number.substring(0, 4) + ' ' + number.substring(4, 8) + ' ' + number.substring(8, 12);
    }
    else {
      return value;
    }
  };
});
app.run([
  "$rootScope",
  function ($rootScope) {
  },
]);
// // Select2Search Directive
// app.directive('select2search', ['$timeout', function ($timeout) {
//   return {
//     restrict: 'C',
//     scope: {
//       ngModel: '=',
//       ngChange: '&',
//       ngDisabled: '='
//     },
//     link: function (scope, element, attrs) {
//       let wrapper, display, dropdown, searchInput, list, observer;

//       $timeout(function () {
//         initializeSelect2();
//       });

//       function initializeSelect2() {
//         const select = element[0];

//         if (select._select2Initialized) return;
//         select._select2Initialized = true;

//         select.style.display = 'none';

//         wrapper = document.createElement('div');
//         wrapper.className = 'select2-wrapper';

//         if (attrs.theme) {
//           wrapper.classList.add(`select2-${attrs.theme}`);
//         }

//         select.parentNode.insertBefore(wrapper, select);
//         wrapper.appendChild(select);

//         display = document.createElement('div');
//         display.className = 'select2-display';
//         display.innerHTML = `
//           <span class='selected-text'>${getSelectedText(select)}</span>
//           <svg class='select2-arrow w-4 h-4 transform transition-transform' fill='none' stroke='currentColor' stroke-width='2' viewBox='0 0 24 24'>
//             <path stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/>
//           </svg>
//         `;
//         wrapper.insertBefore(display, select);

//         dropdown = document.createElement('div');
//         dropdown.className = 'select2-dropdown hidden';

//         searchInput = document.createElement('input');
//         searchInput.type = 'text';
//         searchInput.placeholder = 'Search...';
//         searchInput.className = 'select2-search';
//         dropdown.appendChild(searchInput);

//         list = document.createElement('ul');
//         list.className = 'select2-options';
//         dropdown.appendChild(list);

//         wrapper.appendChild(dropdown);

//         loadOptions();

//         observer = new MutationObserver(function () {
//           loadOptions(searchInput.value);
//           updateDisplay();
//         });

//         observer.observe(select, {
//           childList: true,
//           subtree: true,
//           characterData: true
//         });

//         scope.$watch('ngModel', function (newVal, oldVal) {
//           if (newVal !== oldVal && newVal !== undefined) {
//             select.value = newVal;
//             updateDisplay();
//           }
//         });

//         scope.$watch('ngDisabled', function (newVal) {
//           if (newVal) {
//             display.classList.add('opacity-50', 'cursor-not-allowed');
//             display.classList.remove('cursor-pointer');
//           } else {
//             display.classList.remove('opacity-50', 'cursor-not-allowed');
//             display.classList.add('cursor-pointer');
//           }
//         });

//         setupEventListeners();
//       }

//       function getSelectedText(selectElement) {
//         const selectedOption = selectElement.options[selectElement.selectedIndex];
//         return selectedOption ? selectedOption.text : attrs.placeholder || 'Select...';
//       }

//       function loadOptions(filter = '') {
//         const select = element[0];
//         list.innerHTML = '';

//         let hasVisibleOptions = false;

//         Array.from(select.options).forEach(opt => {
//           if (opt.value === '' && opt.text === '') return;

//           const matchesFilter = !filter || opt.text.toLowerCase().includes(filter.toLowerCase());
//           if (matchesFilter) {
//             const li = document.createElement('li');
//             li.className = 'select2-option p-2 hover:bg-cyan-700 cursor-pointer text-white border-b border-[#fff2] last:border-b-0 transition-colors';

//             if (opt.value === scope.ngModel) {
//               li.classList.add('bg-cyan-800');
//             }

//             li.textContent = opt.text;
//             li.dataset.value = opt.value;
//             list.appendChild(li);
//             hasVisibleOptions = true;
//           }
//         });

//         if (!hasVisibleOptions) {
//           const li = document.createElement('li');
//           li.className = 'select2-no-results p-2 text-gray-400 text-center italic';
//           li.textContent = 'No options found';
//           li.style.cursor = 'default';
//           list.appendChild(li);
//         }
//       }

//       function updateDisplay() {
//         const selectedText = getSelectedText(element[0]);
//         display.querySelector('.selected-text').textContent = selectedText;
//       }

//       function setupEventListeners() {
//         display.addEventListener('click', function () {
//           if (scope.ngDisabled) return;

//           dropdown.classList.toggle('hidden');
//           const arrow = display.querySelector('.select2-arrow');

//           if (!dropdown.classList.contains('hidden')) {
//             arrow.classList.add('rotate-180');
//             searchInput.focus();
//           } else {
//             arrow.classList.remove('rotate-180');
//           }
//         });

//         searchInput.addEventListener('input', function (e) {
//           loadOptions(e.target.value);
//         });

//         searchInput.addEventListener('keydown', function (e) {
//           if (e.key === 'Escape') {
//             dropdown.classList.add('hidden');
//             display.querySelector('.select2-arrow').classList.remove('rotate-180');
//           } else if (e.key === 'Enter' && list.children.length > 0) {
//             const firstOption = list.children[0];
//             if (firstOption.dataset.value) {
//               firstOption.click();
//             }
//           }
//         });

//         list.addEventListener('click', function (e) {
//           if (e.target.tagName === 'LI' && e.target.dataset.value) {
//             const newValue = e.target.dataset.value;

//             scope.$apply(function () {
//               scope.ngModel = newValue;
//               if (scope.ngChange) {
//                 scope.ngChange();
//               }
//             });

//             dropdown.classList.add('hidden');
//             display.querySelector('.select2-arrow').classList.remove('rotate-180');
//             searchInput.value = '';
//             loadOptions('');
//           }
//         });

//         document.addEventListener('click', function (e) {
//           if (!wrapper.contains(e.target)) {
//             dropdown.classList.add('hidden');
//             display.querySelector('.select2-arrow').classList.remove('rotate-180');
//           }
//         });
//       }

//       scope.$on('$destroy', function () {
//         if (observer) {
//           observer.disconnect();
//         }
//       });
//     }
//   };
// }]);