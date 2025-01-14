export default {

	install(Vue, socketio, connection, opts) {

		let socket;

		if (connection != null && typeof connection === "object")
			socket = connection;
		else
			socket = socketio(connection || "", opts);

		Vue.prototype.$socket = socket;

		let addListeners = function() {
			if (this.$options["socket"]) {
				let conf = this.$options.socket;
				if (conf.namespace) {
					this.$socket = socketio(conf.namespace, conf.options);
				}

				if (conf.events) {
					let prefix = conf.prefix || "";
					Object.keys(conf.events).forEach((key) => {
						let func = conf.events[key].bind(this);
						this.$socket.on(prefix + key, func);
						conf.events[key].__binded = func;
					});
				}
			}
		};

		let removeListeners = function() {
			if (this.$options["socket"]) {
				let conf = this.$options.socket;

				if (conf.namespace) {
					this.$socket.disconnect();
				}

				if (conf.events) {
					let prefix = conf.prefix || "";
					Object.keys(conf.events).forEach((key) => {
						this.$socket.off(prefix + key, conf.events[key].__binded);
					});
				}
			}
		};

		Vue.mixin({
			[Vue.version.indexOf("2") === 0 ? "beforeCreate" : "beforeCompile"]: addListeners,
			beforeDestroy: removeListeners
		});

	}

};
