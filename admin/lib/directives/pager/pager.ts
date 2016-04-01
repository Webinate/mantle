module clientAdmin
{
    /**
	* Interface for the object you pass as the directive's 'interface' attribute
	*/
    export interface IPagerRemote
    {
        update : (index?: number, limit? : number) => ng.IPromise<number>;
        invalidate?: () => void;
    }


	/**
	* Controller for the dashboard media section
	*/
    export class Pager implements ng.IDirective
	{
        restrict = 'A';
        transclude = true;
        templateUrl = 'directives/pager/pager.html';
        scope = {
            interface: '=', // must be IPagerRemote
            index: '=?',
            limit: '=?',
            last: '=?'
        }

        constructor()
        {
        }

        link = (scope, elem: JQuery, attributes: angular.IAttributes, ngModel: angular.INgModelController) =>
        {
            scope.index = scope.index || 0;
            scope.limit = scope.limit || 10;
            scope.last = scope.last || 1;
            var iPager : IPagerRemote = scope.interface;

            /**
             * Creates the invalidate function which can be used externally to control
             * when the pager updates its content
             */
            iPager.invalidate = function() {
                handlePromise(iPager.update( scope.index, scope.limit ));
            }

            /**
             * Handles the promise returned by the update function
             */
            function handlePromise(promise: ng.IPromise<number>)
            {
                 promise.then(function(val) {
                    scope.last = val;
                }).catch(function(err) {
                    scope.last = 1;
                });
            }

            /**
            * Gets the current page number
            * @returns {number}
            */
            scope.getPageNum = function(): number
            {
                return (scope.index / scope.limit) + 1;
            }

            /**
            * Gets the total number of pages
            * @returns {number}
            */
            scope.getTotalPages = function()
            {
                return Math.ceil(scope.last / scope.limit);
            }

            /**
            * Sets the page search back to index = 0
            */
            scope.goFirst = function()
            {
                scope.index = 0;
                handlePromise( iPager.update( scope.index, scope.limit) );
            }

            /**
            * Gets the last set of users
            */
            scope.goLast = function()
            {
                scope.index = scope.last - (scope.last % scope.limit);
                handlePromise( iPager.update( scope.index, scope.limit) );
            }

            /**
            * Sets the page search back to index = 0
            */
            scope.goNext = function()
            {
               scope.index += scope.limit;
               handlePromise( iPager.update( scope.index, scope.limit) );
            }

            /**
            * Sets the page search back to index = 0
            */
            scope.goPrev = function()
            {
                scope.index -= scope.limit;
                if (scope.index < 0)
                    scope.index = 0;

                handlePromise( iPager.update( scope.index, scope.limit) );
            }

            // Call the initial update
            handlePromise( iPager.update( scope.index, scope.limit) );
        }

        /**
         * Creates an intance of the pager directive
         */
        static factory(): ng.IDirectiveFactory
        {
            var directive = () => new Pager();
            return directive;
        }
	}
}