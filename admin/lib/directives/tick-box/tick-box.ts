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
            <div class="tick-box" ng-class="getBgType()">
                <div ng-class="getTickType()" ng-show="checked"></div>
            </div>
            {{text}}
        </div>
        `
        scope = {
            text: '=',
            checked: '=',
            onTicked: '&?',
            tickType : '=?'
        }

        link( scope )
        {
            scope.tickType = scope.tickType ? scope.tickType : 'tick';

            /**
             * Gets the tick box background type
             */
            scope.getBgType = function(): any {
                if (scope.tickType == 'tick')
                    return { opaque : true };
            }

            /**
             * Gets the tick box type
             */
            scope.getTickType = function(): any {
                if (scope.tickType == 'tick')
                    return { tick : true };
                else
                    return { cross : true };
            }

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