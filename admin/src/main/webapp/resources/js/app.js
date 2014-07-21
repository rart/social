/**
 * Angular Module
 */
var app = angular.module('CrafterAdminConsole', ['ngRoute', 'ui.bootstrap']);

/**
 * Global variables
 */
var defaultContext = 'f5b143c2-f1c0-4a10-b56e-f485f00d3fe9';
var commentsSortBy = 'lastModifiedDate';
var commentsSortOrder = 'ASC';

var moderationStatus = [
    {
        label: 'Unmoderated',
        value: 'UNMODERATED',
        default: true
    },
    {
        label: 'Approved',
        value: 'APPROVED'
    },
    {
        label: 'Pending',
        value: 'PENDING'
    },
    {
        label: 'Spam',
        value: 'SPAM'
    },
    {
        label: 'Trash',
        value: 'TRASH'
    }
];

var moderationStatusActions = {
    'UNMODERATED': [
        {
            label: 'Approve',
            execute: function(ctxId, comment, $scope) {
                $scope.commentService.updateStatus(ctxId, comment, 'APPROVED').then(function(comment) {
                    $scope.commentStatusUpdatedCallback(comment);
                });
            }
        },
        {
            label: 'Mark as Spam',
            execute: function(ctxId, comment, $scope) {
                $scope.commentService.updateStatus(ctxId, comment, 'SPAM').then(function(comment) {
                    $scope.commentStatusUpdatedCallback(comment);
                });
            }
        },
        {
            label: 'Mark as Trash',
            execute: function(ctxId, comment, $scope) {
                $scope.commentService.updateStatus(ctxId, comment, 'TRASH').then(function(comment) {
                    $scope.commentStatusUpdatedCallback(comment);
                });
            }
        },
        {
            label: 'Save Changes',
            execute: function(ctxId, comment, $scope) {
                $scope.commentService.updateBody(ctxId, comment).then(function(comment) {
                    $scope.commentBodyUpdatedCallback(comment);
                });
            }
        }
        ,
        {
            label: 'Reset',
            execute: function(ctxId, comment) {
                resetBody(comment);
            }
        }
    ],
    'APPROVED': [
        {
            label: 'Mark as Spam',
            execute: function(ctxId, comment, $scope) {
                $scope.commentService.updateStatus(ctxId, comment, 'SPAM').then(function(comment) {
                    $scope.commentStatusUpdatedCallback(comment);
                });
            }
        },
        {
            label: 'Mark as Trash',
            execute: function(ctxId, comment, $scope) {
                $scope.commentService.updateStatus(ctxId, comment, 'TRASH').then(function(comment) {
                    $scope.commentStatusUpdatedCallback(comment);
                });
            }
        },
        {
            label: 'Mark as Unmoderated',
            execute: function(ctxId, comment, $scope) {
                $scope.commentService.updateStatus(ctxId, comment, 'UNMODERATED').then(function(comment) {
                    $scope.commentStatusUpdatedCallback(comment);
                });
            }
        },
        {
            label: 'Save Changes',
            execute: function(ctxId, comment, $scope) {
                $scope.commentService.updateBody(ctxId, comment).then(function(comment) {
                    $scope.commentBodyUpdatedCallback(comment);
                });
            }
        }
        ,
        {
            label: 'Reset',
            execute: function(ctxId, comment) {
                resetBody(comment);
            }
        }
    ],
    'PENDING': [
        {
            label: 'Approve',
            execute: function(ctxId, comment, $scope) {
                $scope.commentService.updateStatus(ctxId, comment, 'APPROVED').then(function(comment) {
                    $scope.commentStatusUpdatedCallback(comment);
                });
            }
        },
        {
            label: 'Mark as Trash',
            execute: function(ctxId, comment, $scope) {
                $scope.commentService.updateStatus(ctxId, comment, 'TRASH').then(function(comment) {
                    $scope.commentStatusUpdatedCallback(comment);
                });
            }
        },
        {
            label: 'Save Changes',
            execute: function(ctxId, comment, $scope) {
                $scope.commentService.updateBody(ctxId, comment).then(function(comment) {
                    $scope.commentBodyUpdatedCallback(comment);
                });
            }
        },
        {
            label: 'Reset',
            execute: function(ctxId, comment) {
                resetBody(comment);
            }
        }
    ],
    'SPAM': [
        {
            label: 'Permanently delete',
            execute: function(ctxId, comment, $scope) {
                $scope.commentService.deleteComment(ctxId, comment).then(function() {
                    $scope.commentDeletedCallback(comment);
                });
            }
        },
        {
            label: 'Mark as Unmoderated',
            execute: function(ctxId, comment, $scope) {
                $scope.commentService.updateStatus(ctxId, comment, 'UNMODERATED').then(function(comment) {
                    $scope.commentStatusUpdatedCallback(comment);
                });
            }
        }
    ],
    'TRASH': [
        {
            label: 'Permanently delete',
            execute: function(ctxId, comment, $scope) {
                $scope.commentService.deleteComment(ctxId, comment).then(function() {
                    $scope.commentDeletedCallback(comment);
                });
            }
        }
    ]
};

/**
 * Constants
 */
app.constant('paginationConfig', {
    itemsPerPage: 10,
    boundaryLinks: true,
    directionLinks: true,
    previousText: '‹',
    nextText: '›',
    firstText: '«',
    lastText: '»',
    rotate: true
});

/**
 * Filters
 */
app.filter('truncateIfTooLarge', function() {
    return function(input) {
        if (input.length > 15) {
            return input.substring(0, 15) + '...';
        } else {
            return input;
        }
    }
});

/**
 * Global functions
 */
function findComment(comments, id) {
    for (var i = 0; i < comments.length; i++) {
        if (comments[i]._id == id) {
            return i;
        }
    }

    return -1;
}

function getObject(url, $http) {
    return $http.get(url).then(function(result){
        return result.data;
    });
}

function postParams(url, params, $http) {
    return $http.post(url, $.param(params), { headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).then(
        function(result){
            return result.data;
        }
    );
}

function putParams(url, params, $http) {
    return $http.put(url, $.param(params), { headers: {'Content-Type': 'application/x-www-form-urlencoded'}}).then(
        function(result){
            return result.data;
        }
    );
}

function deleteObject(url, $http) {
    return $http.delete(url).then(function(result){
        return result.data;
    });
}

function showGrowlMessage(type, message) {
    $.growl(message, {
        type: type,
        pause_on_mouseover: true,
        position: {
            from: 'top',
            align: 'center'
        },
        offset: 40
    });
}

function resetBody(comment) {
    comment.body = comment.bodyOrig;
}

function createFinalProfileQuery(query) {
    return encodeURIComponent('{username: {$regex: ".*' + query + '.*", $options: "i"}}');
}

/**
 * Http Interceptors
 */
app.factory('httpErrorHandler', function ($q) {
    return {
        'responseError': function(rejection) {
            var message;

            if (rejection.status == 0) {
                message = 'Unable to communicate with the server. Please try again later or contact IT support';
            } else {
                message = 'Server responded with ' + rejection.status + ' error';
                if (rejection.data.error) {
                    message += ': <strong>' + rejection.data.error + '</strong>';
                }

                message += '. Please contact IT support for more information';
            }

            showGrowlMessage('danger', message);

            return $q.reject(rejection);
        }
    };
});

app.config(['$httpProvider', function($httpProvider) {
    $httpProvider.interceptors.push('httpErrorHandler');
}]);

/**
 * Services
 */
app.factory('contextService', function($http) {
    return {
        getContexts: function() {
            var url = socialRestBaseUrl + '/system/context/all?tenant=' + defaultContext;

            return getObject(url, $http);
        },
        createContext: function(name) {
            var url = socialRestBaseUrl + '/system/context?tenant=' + defaultContext;

            return postParams(url, { contextName: name }, $http);
        },
        addProfileToContext: function(ctxId, profileId, roles) {
            var url = socialRestBaseUrl + '/system/context/' + ctxId + '/' + profileId + '?tenant=' + defaultContext;

            return postParams(url, { roles: roles.join() }, $http);
        },
        removeProfileFromContext: function(ctxId, profileId) {
            var url = socialRestBaseUrl + '/system/context/' + ctxId + '/' + profileId + '?tenant=' + defaultContext;

            return deleteObject(url, $http);
        }
    }
});

app.factory('commentService', function($http) {
    return {
        getCommentsCount: function(ctxId, status) {
            var url = socialRestBaseUrl + '/comments/moderation/' + status + '/count?tenant=' + ctxId;

            return getObject(url, $http);
        },
        getComments: function(ctxId, status, pageNumber, pageSize) {
            var url = socialRestBaseUrl + '/comments/moderation/' + status + '?tenant=' + ctxId;
            if (pageNumber != undefined && pageNumber != null) {
                url += '&pageNumber=' + pageNumber;
            }
            if (pageSize != undefined && pageSize != null) {
                url += '&pageSize=' + pageSize;
            }

            url += '&sortBy=' + commentsSortBy;
            url += '&sortOrder=' + commentsSortOrder;

            return getObject(url, $http);
        },
        updateStatus: function(ctxId, comment, newStatus) {
            var url = socialRestBaseUrl + '/comments/' + comment._id + '/moderate?tenant=' + ctxId;

            return putParams(url, { status: newStatus }, $http);
        },
        updateBody: function(ctxId, comment) {
            var url = socialRestBaseUrl + '/comments/' + comment._id + '?tenant=' + ctxId;

            return putParams(url, { body: comment.body }, $http);
        },
        deleteComment: function(ctxId, comment) {
            var url = socialRestBaseUrl + '/comments/' + comment._id + '?tenant=' + ctxId;

            return deleteObject(url, $http);
        }
    }
});

app.factory('actionsService', function($http) {
    return {
        getActions: function(ctxId) {
            var url = socialRestBaseUrl + '/system/actions?tenant=' + ctxId;

            return getObject(url, $http);
        },
        updateAction: function(ctxId, actionName, roles) {
            var url = socialRestBaseUrl + '/system/actions?tenant=' + ctxId;

            putParams(url, { actionName: actionName, roles: roles.join() }, $http).then(function() {
                showGrowlMessage('success', 'Action \'' + actionName + '\' updated');
            });
        }
    }
});

app.factory('tenantService', function($http) {
    return {
        getTenants: function() {
            var url = profileRestBaseUrl + '/tenant/all?accessTokenId=' + profileAccessToken;

            return getObject(url, $http);
        }
    }
});

app.factory('profileService', function($http) {
    return {
        getCountByQuery: function(tenantName, query) {
            var url = profileRestBaseUrl + '/profile/count_by_query?accessTokenId=' + profileAccessToken;
            url += '&tenantName=' + tenantName;
            url += '&query=' + createFinalProfileQuery(query);

            return getObject(url, $http);
        },
        findProfiles: function(tenantName, query, start, count) {
            var url = profileRestBaseUrl + '/profile/by_query?accessTokenId=' + profileAccessToken;
            url += '&tenantName=' + tenantName;
            url += '&query=' + createFinalProfileQuery(query);

            if (start != undefined && start != null) {
                url += '&start=' + start;
            }
            if (count != undefined && count != null) {
                url += '&count=' + count;
            }

            return getObject(url, $http);
        },
        getProfile: function(id) {
            var url = profileRestBaseUrl + '/profile/' + id + '?accessTokenId=' + profileAccessToken;

            return getObject(url, $http);
        }
    }
});

/**
 * Routing
 */
app.config(function($routeProvider) {
    $routeProvider.when('/', {
        controller: 'ModerationDashboardController',
        templateUrl: contextPath + '/moderation-dashboard',
        resolve: {
            contexts: function(contextService) {
                return contextService.getContexts();
            }
        }
    });

    $routeProvider.when('/moderation-dashboard', {
        controller: 'ModerationDashboardController',
        templateUrl: contextPath + '/moderation-dashboard',
        resolve: {
            contexts: function(contextService) {
                return contextService.getContexts();
            }
        }
    });

    $routeProvider.when('/contexts', {
        controller: 'ContextsController',
        templateUrl: contextPath + '/contexts',
        resolve: {
            contexts: function(contextService) {
                return contextService.getContexts();
            }
        }
    });

    $routeProvider.when('/security-actions', {
        controller: 'SecurityActionsController',
        templateUrl: contextPath + '/security-actions',
        resolve: {
            contexts: function(contextService) {
                return contextService.getContexts();
            }
        }
    });

    $routeProvider.when('/search-profiles', {
        controller: 'SearchProfilesController',
        templateUrl: contextPath + '/search-profiles',
        resolve: {
            tenants: function(tenantService) {
                return tenantService.getTenants();
            }
        }
    });

    $routeProvider.when('/profile/:id', {
        controller: 'ProfileController',
        templateUrl: contextPath + '/profile',
        resolve: {
            profile: function($route, profileService) {
                return profileService.getProfile($route.current.params.id);
            },
            contexts: function(contextService) {
                return contextService.getContexts();
            }
        }
    });

    $routeProvider.otherwise({
        redirectTo: '/'
    });
});

/**
 * Controllers
 */
app.controller('ModerationDashboardController', function($scope, commentService, contexts) {
    $scope.moderationStatus = moderationStatus;
    $scope.moderationStatusActions = moderationStatusActions;
    $scope.commentService = commentService;
    $scope.contexts = contexts;
    $scope.selectedContext = $scope.contexts[0];
    $scope.itemsPerPage = 5;

    $scope.getCurrentPage = function() {
        commentService.getComments($scope.selectedContext._id, $scope.selectedStatus, $scope.currentPage,
            $scope.itemsPerPage).then(function(comments) {
                for (var i = 0; i < comments.length; i++) {
                    comments[i].bodyOrig = comments[i].body;
                }

                $scope.comments = comments;
            });
    };

    $scope.resetStatus = function() {
        for (var i = 0; i < moderationStatus.length; i++) {
            if (moderationStatus[i].default) {
                $scope.selectedStatus = moderationStatus[i].value;

                break;
            }
        }
    };

    $scope.getComments = function() {
        commentService.getCommentsCount($scope.selectedContext._id, $scope.selectedStatus).then(function(count) {
            $scope.totalItems = count;
            $scope.currentPage = 1;

            $scope.getCurrentPage();
        });
    };

    $scope.resetStatusAndGetComments = function() {
        $scope.resetStatus();
        $scope.getComments();
    };

    $scope.executeAction = function(action, comment) {
        action.execute($scope.selectedContext._id, comment, $scope);
    };

    $scope.commentStatusUpdatedCallback = function(comment) {
        $scope.getComments();

        showGrowlMessage('success', 'Status of comment \'' + comment._id + '\' changed to \'' +
            comment.moderationStatus + '\'');
    };

    $scope.commentBodyUpdatedCallback = function(comment) {
        comment.bodyOrig = comment.body;

        showGrowlMessage('success', 'Comment \'' + comment._id + '\' updated');
    };

    $scope.commentDeletedCallback = function(comment) {
        $scope.getComments();

        showGrowlMessage('success', 'Comment \'' + comment._id + '\' deleted');
    };

    $scope.resetStatusAndGetComments();
});

app.controller('ContextsController', function($scope, contexts, contextService) {
    $scope.contexts = contexts;
    $scope.contextName = '';

    $scope.createContext = function() {
        contextService.createContext($scope.contextName).then(function(context) {
            contexts.push(context);

            showGrowlMessage('success', 'Context \'' + context._id + '\' created');
        });
    }
});

app.controller('SecurityActionsController', function($scope, actionsService, contexts) {
    $scope.contexts = contexts;
    $scope.selectedContext = $scope.contexts[0];
    $scope.actionsOrderedBy = '+actionName';

    $scope.getActions = function() {
        actionsService.getActions($scope.selectedContext._id).then(function(actions) {
            $scope.actions = actions;
        });
    };

    $scope.updateAction = function(action) {
        actionsService.updateAction($scope.selectedContext._id, action.actionName, action.roles);
    };

    $scope.getActions();
});

app.controller('SearchProfilesController', function($scope, tenants, profileService) {
    $scope.tenants = tenants;
    $scope.selectedTenantName = $scope.tenants[0].name;
    $scope.searchText = '';
    $scope.itemsPerPage = 10;

    $scope.isValidUsername = function(text) {
        return /^\w+$/.test(text);
    };

    $scope.getCurrentPage = function() {
        var count = $scope.itemsPerPage;
        var start = ($scope.currentPage - 1) * count;

        profileService.findProfiles($scope.selectedTenantName, $scope.searchText, start, count).then(
            function(profiles) {
                $scope.profiles = profiles;
            }
        );
    };

    $scope.doSearch = function() {
        if ($scope.isValidUsername($scope.searchText)) {
            profileService.getCountByQuery($scope.selectedTenantName, $scope.searchText).then(function(count) {
                $scope.totalItems = count;
                $scope.currentPage = 1;

                $scope.getCurrentPage();
            });
        } else {
            showGrowlMessage('info', 'Search term must be a word with no spaces');
        }
    };

    $scope.getSocialContextNames = function(profile) {
        var names = [];

        if (profile.attributes.socialTenants) {
            for (var i = 0; i < profile.attributes.socialTenants.length; i++) {
                names.push(profile.attributes.socialTenants[i].tenant);
            }
        }

        return names;
    };
});

app.controller('ProfileController', function($scope, profile, contexts, contextService) {
    $scope.profile = profile;
    $scope.contexts = contexts;
    $scope.selectedContext = $scope.contexts[0];
    $scope.contextRoles = [];

    $scope.addProfileToContext = function() {
        contextService.addProfileToContext($scope.selectedContext._id, $scope.profile.id, $scope.contextRoles).then(
            function(profile) {
                $scope.profile = profile;

                showGrowlMessage('success', 'Profile added to context \'' + $scope.selectedContext._id + '\'');
            }
        )
    };

    $scope.removeProfileFromContext = function(ctxId) {
        contextService.removeProfileFromContext(ctxId, $scope.profile.id).then(function(profile) {
            $scope.profile = profile;

            showGrowlMessage('success', 'Profile removed from context \'' + ctxId + '\'');
        });
    };

    $scope.test = function() {
        alert($scope.selectedContext.contextName);
    }
});


