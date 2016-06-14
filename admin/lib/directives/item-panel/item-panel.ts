module clientAdmin
{
	/**
     * Small directive that represents an div item that has a preview, content and delete section.
     * Ideal for database entries displayed in a list.
     */
    export class ItemPanel implements ng.IDirective
	{
        restrict = 'E';
        transclude = {
            'preview': 'panelPreview',
            'content': 'panelContent'
        };
        templateUrl = 'directives/item-panel/item-panel.html';
        scope = {
            onDelete: '=?',
            model: '=?',
            confirmDelete : '=?'
        }

        link( scope )
        {
            scope.confirmDelete = scope.confirmDelete || false;
        }

        /**
         * Creates an intance of the pager directive
         */
        static factory(): ng.IDirectiveFactory
        {
            var directive = () => new ItemPanel();
            return directive;
        }
	}
}