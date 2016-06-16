module clientAdmin
{
	/**
	* Controller for the dashboard media section
	*/
    export class SearchBar implements ng.IDirective
	{
        restrict = 'E';
        template = `
            <div class="search">
                <input type="text" ng-model="value" />
                <div class="search-button sprite sprite-search" ng-click="onClick(value)"></div>
            </div>`;
        scope = {
            onClick: '=',
            value: '='
        }

        constructor()
        {
        }

        /**
         * Creates an intance of the pager directive
         */
        static factory(): ng.IDirectiveFactory
        {
            var directive = () => new SearchBar();
            return directive;
        }
	}
}