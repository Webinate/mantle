module clientAdmin
{
	/**
	* Small directive for a detail section
	*/
    export class Detail implements ng.IDirective
	{
        restrict = 'E';
        template = `
           <div class="content-view-detail">
            <div class="label">{{text}}: <span ng-if="info && info != ''" class="info">{{info}}</span></div>
            <ng-transclude class="detail-transclude"></ng-transclude>
            <div class="fix"></div>
           </div>`;
        transclude = true;
        scope = {
            text: '=?',
            info: '=?',
            onRender : '&?'
        }

        link( scope ) {
            if (scope.onRender)
                scope.onRender();
        }

        /**
         * Creates an intance of the pager directive
         */
        static factory(): ng.IDirectiveFactory
        {
            var directive = () => new Detail();
            return directive;
        }
	}
}