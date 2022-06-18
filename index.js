if (process.NODE_ENV === 'development') {
	require('./dist/x-action.dev');
}
else {
	require('./dist/x-action');
}
