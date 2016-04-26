module clientAdmin
{
	/**
	* Controller for the modal window that shows up when an error occurs
	*/
    export class ErrorModal implements ng.IDirective
	{
        restrict = 'A';
        templateUrl = 'directives/error-modal/error-modal.html';
        scope = {
            visible: '=',
            message: '='
        }

        constructor()
        {
        }

        /**
         * Creates an intance of the directive
         */
        static factory(): ng.IDirectiveFactory
        {
            var directive = () => new ErrorModal();
            return directive;
        }
	}
}