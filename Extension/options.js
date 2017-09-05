var settingsPort = chrome.runtime.connect({ name: 'settings' }),
    apiPort = chrome.runtime.connect({ name: 'api' });

settingsPort.onMessage.addListener(function(response) {
    if (response.request.method === 'get') {
        var settings = response.settings,
            api = response.settings.api;

        switch (response.request.caller) {
            case 'setFields':
                $('#apiPort').val(settings.api.port);
                $('#apiHost').val(settings.api.host);
                $('#apiUsername').val(settings.api.username);
                $('#apiPassword').val(settings.api.password);
                $('#apiUriFormat').val(settings.api.uriFormat);

                $('#magnetCount').html(settings.magnets.length);
                $('#clearMagnets').attr('disabled', settings.magnets.length === 0);

                api.wrapFields = {}
                api.wrapFields.start = '<span style="color:orange;">';
                api.wrapFields.end = '</span>';

                apiPort.postMessage({ method: 'buildUri', api: api });

                $('.easyPaginateNav').remove();
                $('#easyPaginate').empty();

                $.each(settings.magnets, function(i, v) {
                    $('#easyPaginate').append('<div class="well well-sm">' + v + '</div>');
                });

                $('#easyPaginate').easyPaginate({
                    paginateElement: 'div',
                    elementsPerPage: 5,
                    effect: 'climb'
                });
                break;
            case 'getFields':
                settings.api.port = $('#apiPort').val();
                settings.api.host = $('#apiHost').val();
                settings.api.username = $('#apiUsername').val();
                settings.api.password = $('#apiPassword').val();
                settings.api.uriFormat = $('#apiUriFormat').val();

                settingsPort.postMessage({ method: 'set', caller: 'setFields', settings: settings });
                break;
            case 'refreshUri':
                api.port = $('#apiPort').val();
                api.host = $('#apiHost').val();
                api.username = $('#apiUsername').val();
                api.password = $('#apiPassword').val();
                api.uriFormat = $('#apiUriFormat').val();
                
                api.wrapFields = { start: '<span style="color:orange;">', end: '</span>'};

                apiPort.postMessage({ method: 'buildUri', api: api });
                break;
            case 'clearMagnets':
                settings.magnets = [];

                settingsPort.postMessage({ method: 'set', caller: 'clearMagnets', settings: settings });

                $('#magnetCount').html(settings.magnets.length);
                $('#clearMagnets').attr('disabled', settings.magnets.length === 0);
                break;
        }
    }
});

apiPort.onMessage.addListener(function(response) {
    $('#apiUriPreview').html(response.uri);
});

$(function() {
    settingsPort.postMessage({ method: 'get', caller: 'setFields' });

    $('#saveOptions').click(function(e) {
        settingsPort.postMessage({ method: 'get', caller: 'getFields' });
    });

    $("#apiUriFormat").keyup(function() {
        settingsPort.postMessage({ method: 'get', caller: 'refreshUri' });
    });

    $('#clearMagnets').click(function (e) {
        settingsPort.postMessage({ method: 'get', caller: 'clearMagnets' });
    });

    $('#refreshMagnets').click(function (e) {
        settingsPort.postMessage({ method: 'get', caller: 'setFields' });
    });

    $('#settingsTabs a:first').tab('show');
});