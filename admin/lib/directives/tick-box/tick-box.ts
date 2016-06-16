module clientAdmin
{
	/**
	* Simple directive a checkbox
	*/
    export class TickBox implements ng.IDirective
	{
        transclude = true;
        restrict = 'E';
        template = `
        <div class="checkbox" ng-click="onClick()">
            <div class="tick-box">
                <div class="tick" ng-show="checked"></div>
            </div>
            {{text}}
        </div>
        `
        scope = {
            text: '=',
            checked: '=',
            onTicked: '&?'
        }

        link( scope )
        {
            /**
             * When we click the tick box, we toggle the checked state
             */
            scope.onClick = function()
            {
                if (scope.onTicked)
                    scope.onTicked({ticked: scope.checked});
            }
        }

        /**
         * Creates an intance of the pager directive
         */
        static factory(): ng.IDirectiveFactory {
            var directive = () => new TickBox();
            return directive;
        }
	}
}