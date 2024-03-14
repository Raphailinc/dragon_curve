var DRAGON = (function () {


   // МАТРИЧНАЯ МАТЕМАТИКА
   // -----------

   var matrix = {
      mult: function ( m, v ) {
         return [ m[0][0] * v[0] + m[0][1] * v[1],
                  m[1][0] * v[0] + m[1][1] * v[1] ];
      },

      minus: function ( a, b ) {
         return [ a[0]-b[0], a[1]-b[1] ];
      },

      plus: function ( a, b ) {
         return [ a[0]+b[0], a[1]+b[1] ];
      }
   };


   // SVG МАТЕРИАЛЫ
   // ---------

   // Превращаем пару точек в путь SVG, например «M1 1L2 2».
   var toSVGpath = function (a, b) {  // тип системного сбоя
      return "M" + a[0] + " " + a[1] + "L" + b[0] + " " + b[1];
   };


   // СОЗДАНИЕ ДРАКОНА
   // -------------

   // Создаём дракона с лучшим фрактальным алгоритмом
   var fractalMakeDragon = function (svgid, ptA, ptC, state, lr, interval) {

      // создаём новый <path>
      var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute( "class",  "dragon"); 
      path.setAttribute( "d", toSVGpath(ptA, ptC) );

      // добавляем новый путь к существующему <svg>
      var svg = document.getElementById(svgid); // вызов может быть удален
      svg.appendChild(path);

      // если у нас есть еще итерации...
      if (state > 1) {

         // сделаем новую точку слева или справа
         var growNewPoint = function (ptA, ptC, lr) {
            var left  = [[ 1/2,-1/2 ], 
                         [ 1/2, 1/2 ]]; 

            var right = [[ 1/2, 1/2 ],
                         [-1/2, 1/2 ]];

            return matrix.plus(ptA, matrix.mult( lr ? left : right, 
                                                 matrix.minus(ptC, ptA) ));
         }; 

         var ptB = growNewPoint(ptA, ptC, lr, state);

         // затем рекурсивно используем каждую новую строку, одну левую, одну правую
         var recurse = function () {
            // при рекурсии глубже удаляем этот путь svg
            svg.removeChild(path);

            // затем снова вызоваем новую пару, уменьшив состояние
            fractalMakeDragon(svgid, ptB, ptA, state-1, lr, interval);
            fractalMakeDragon(svgid, ptB, ptC, state-1, lr, interval);
         };

         window.setTimeout(recurse, interval);
      }
   };


   // Экспортируем эти функции
   // ----------------------
   return {
      fractal: fractalMakeDragon

      // АРГУМЕНТЫ
      // ---------
      //    svgid    идентификатор элемента <svg>
      //    ptA      первая точка [x,y] (сверху слева)
      //    ptC      вторая точка [x,y]
      //    state    число, указывающее, сколько шагов рекурсии
      //    lr       true/false, чтобы сделать новую точку слева или справа

      // КОНФИГУРАЦИЯ
      // ------
      // Правила CSS должны быть сделаны для следующих
      //    svg#fractal
      //    svg path.dragon
   };

}());
