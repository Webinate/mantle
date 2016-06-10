module clientAdmin
{
    /**
	* Creates a blue add button
	*/
    export class SimpleButton implements ng.IDirective
	{
        restrict = 'E';
        template = '';
        scope = {
            text: '=',
            noIcon: '=?'
        }

        constructor(color : string = `blue`, template? : string )
        {
            this.template = template || `<div class="button ${color}"><div class="cross" ng-show="!noIcon"></div>{{text}}</div>`;
        }

        link (scope, elem: JQuery, attributes: angular.IAttributes, ngModel: angular.INgModelController)
        {
            scope.noIcon = scope.noIcon || false;
        }

        /**
         * Creates an intance of the directive
         */
        static factory(): ng.IDirectiveFactory
        {
            var directive = () => new SimpleButton();
            return directive;
        }
	}

	/**
	* Creates a blue add button
	*/
    export class AddButton extends SimpleButton
	{
        constructor()
        {
            super();
        }

        /**
         * Creates an intance of the directive
         */
        static factory(): ng.IDirectiveFactory
        {
            var directive = () => new AddButton();
            return directive;
        }
	}

    /**
	* Creates a red remove button
	*/
    export class RemoveButton extends SimpleButton
	{
        constructor()
        {
            super('red');
        }

        /**
         * Creates an intance of the directive
         */
        static factory(): ng.IDirectiveFactory
        {
            var directive = () => new RemoveButton();
            return directive;
        }
	}

    /**
	* Creates a green approve button
	*/
    export class ApproveButton extends SimpleButton
	{
        constructor()
        {
            super('green')
        }

        /**
         * Creates an intance of the directive
         */
        static factory(): ng.IDirectiveFactory
        {
            var directive = () => new ApproveButton();
            return directive;
        }
	}

    /**
	* Creates a blue button that toggles from an expanded to contracted state (+ -)
	*/
    export class ToggleButton implements ng.IDirective
	{
        restrict = 'E';
        template = '<div class="button blue" ng-click="expanded=!expanded"><div class="cross" ng-show="!expanded"></div><div class="minus" ng-show="expanded"></div>{{text}}</div>';
        scope = {
            text: '=',
            expanded: '=?'
        }

        constructor()
        {
        }

        link (scope, elem: JQuery, attributes: angular.IAttributes, ngModel: angular.INgModelController)
        {
            scope.expanded = scope.expanded || false;
        }

        /**
         * Creates an intance of the directive
         */
        static factory(): ng.IDirectiveFactory
        {
            var directive = () => new ToggleButton();
            return directive;
        }
	}
}