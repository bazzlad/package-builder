// Super stepper class

var Stepper = function(stepperVars) {
   if (!stepperVars) {
      console.log("No stepper vars passed through");
      return;
   }
   var _this = this;
   this.steps = 0;
   this.current = 0;
   this.container = $("#" + stepperVars.id);
   this.navigation = false;
   this.navButtons = {
      forward: false,
      back: false,
      finish: false
   };
   this.direction = false;
   this.disableForwardBtn = false;
   // finish function
   this.finish = function() {
      console.log("You need to pass through a finish function");
   };
   if (stepperVars.disableForwardBtn) {
      this.disableForwardBtn = stepperVars.disableForwardBtn;
   }
   if (stepperVars.finish) {
      this.finish = stepperVars.finish;
   }
   // step confirmation arr
   this.stepConfirm = [];
   if (stepperVars.stepConfirm) {
      this.stepConfirm = stepperVars.stepConfirm;
   }
   // step confirmation arr
   this.stepInit = [];
   if (stepperVars.stepInit) {
      this.stepInit = stepperVars.stepInit;
   }
   // custom routes
   this.skipSteps = [];
   if (stepperVars.skipSteps) {
      this.skipSteps = stepperVars.skipSteps;
   }

   this.init = function() {
      // 1) count steps
      var steps = this.container.find(".step");
      this.steps = (steps.length-1);
      // re-hide each step
      steps.each(function() {
         $(this).hide();
      })
      if (this.steps === -1) {
         console.log("Stepper container requires steps");
         return;
      }

      // show first step
      $(steps[0]).show();
      if (this.stepInit[0]) {
         this.stepInit[0]();
      }

      // 2) sort navigation
      if (this.container.find(".step-nav").length) {
         // set vars
         this.navigation = true;
         this.navButtons.forward = this.container.find('.step-forward');
         this.navButtons.back = this.container.find('.step-back');
         this.navButtons.finish = this.container.find('.step-finish');
         // set clicks

         this.navButtons.forward.click(function() {
            if ($(this).attr('disabled')) {
               return;
            }
            _this.stepForward();
         });
         this.navButtons.back.click(function() {
            _this.stepBack();
         });
         this.navButtons.finish.click(function() {
            _this.finish();
         });
         this.checkNavigation();
         this.container.find(".step-nav").show();
      }
   };
   this.checkNavigation = function() {
      if (!this.navigation) {
         return;
      }
      this.navButtons.forward.show();
      if (this.disableForwardBtn) {
         this.navButtons.forward.attr('disabled', 'disabled');
      }
      this.navButtons.back.show();
      this.navButtons.finish.hide();

      if (this.current === 0) {
         this.navButtons.back.hide();
      }
      if (this.current === this.steps) {
         this.navButtons.forward.hide();
         this.navButtons.finish.show();
      }
   };
   this.stepTo = function(step) {
      if (step > this.steps) {
         console.log("You've gone too far");
         return;
      }

      // try and apply skip steps to warp
      // assume user is moving forward
      if (this.skipSteps) {
         if (this.skipSteps.includes(step)) {
            this.current = step;
            this.stepForward(true);
            return;
         }
      }

      this.direction = 'warp';
      this.current = step;
      var steps = this.container.find(".step");
      $(steps).hide();
      $(steps[step]).show();
      if (this.stepInit[step]) {
         this.stepInit[step]();
      }
      this.checkNavigation();
   };
   this.stepForward = function(skipValidation) {
      if (event) {
         event.preventDefault();
      }

      if (this.current === this.steps) {
         console.log("Steps complete");
         return;
      }

      if (!skipValidation) {
         if (this.stepConfirm[this.current]) {
            if (!this.stepConfirm[this.current]()) {
               console.log("Failed step validation");
               return false;
            }
         }
      }
      this.direction = 'forward';
      this.current++;

      if (this.skipSteps) {
         if (this.skipSteps.includes(this.current)) {
            this.stepForward(true);
            return;
         }
      }

      var steps = this.container.find(".step");
      $(steps).hide();
      $(steps[this.current]).show();
      if (this.stepInit[this.current]) {
         this.stepInit[this.current]();
      }
      this.checkNavigation();
   };
   this.stepBack = function() {
      if (event) {
         event.preventDefault();
      }
      if (this.current === 0) {
         console.log("Already at the start");
         return;
      }
      this.direction = 'backward';
      this.current--;

      if (this.skipSteps) {
         if (this.skipSteps.includes(this.current)) {
            this.stepBack();
            return;
         }
      }

      var steps = this.container.find(".step");
      $(steps).hide();
      $(steps[this.current]).show();
      if (this.stepInit[this.current]) {
         this.stepInit[this.current]();
      }
      this.checkNavigation();
   };
   this.enableForward = function() {
      // add time out for ui to catch up
      var _this = this;
      window.setTimeout(function() {
         if (typeof(_this.navButtons.forward) === "boolean") {
            _this.container.find('.step-forward').removeAttr("disabled");
         } else {
            _this.navButtons.forward.removeAttr("disabled");
         }
      }, 10);
   };
   this.disableForward = function() {
      // add time out for ui to catch up
      var _this = this;
      window.setTimeout(function() {
         if (typeof(_this.navButtons.forward) === "boolean") {
            _this.container.find('.step-forward').attr("disabled", "disabled");
         } else {
            _this.navButtons.forward.attr("disabled", "disabled");
         }
      }, 10);
   };
   // allow dynamic step skipping
   this.addSkipStep = function(step) {
      if (Array.isArray(step)) {
         for (var i=0; i<step.length; i++) {
            var currentStep = step[i];
            if (this.skipSteps.indexOf(currentStep) === -1) {
               this.skipSteps.push(currentStep);
            }
         }
      } else {
         if (this.skipSteps.indexOf(step) === -1) {
            this.skipSteps.push(step);
         }
      }
   };
   this.removeSkipStep = function(step) {
      if (Array.isArray(step)) {
         for (var i=0; i<step.length; i++) {
            var currentStep = step[i];
            if (this.skipSteps.indexOf(currentStep) !== -1) {
               var pos = this.skipSteps.indexOf(currentStep);
               this.skipSteps.splice(pos, 1);
            }
         }
      } else {
         if (this.skipSteps.indexOf(step) !== -1) {
            var pos = this.skipSteps.indexOf(step);
            this.skipSteps.splice(pos, 1);
         }
      }
   };
};
