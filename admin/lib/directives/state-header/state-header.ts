module clientAdmin
{
	/**
	* Simple directive for each state header
	*/
    export class StateHeader implements ng.IDirective
	{
        transclude = true;
        restrict = 'E';
        template = '<div class="sub-menu"><h>{{text}}</h><img ng-show="loading" src="/media/images/loader.gif" /><div class="console"><ng-transclude></ng-transclude></div></div>';
        scope = {
            text: '=',
            loading: '='
        }

        /**
         * Creates an intance of the pager directive
         */
        static factory(): ng.IDirectiveFactory {
            var directive = () => new StateHeader();
            return directive;
        }
	}
}