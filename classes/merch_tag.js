class MerchTag {
	constructor(image, title, description, url) {
		this.image = image;
		this.title = title;
		this.description = description;
		this.url = url;
	}

	getHTMLString() {
		let string =
			`<div class='col-3'>
				<div class='card'>
					<img class='card-img-top' src='${this.image}' alt='Card image cap'>
					<div class='card-body'>
						<a href='${this.url}' class='card-title'>${this.title}</a>
						<p class='small'>${this.description}</p>
					</div>
				</div>
			</div>`;
		return string
	}

	compressed() {
		return {
			image: this.image,
			title: this.title,
			description: this.description,
			url: this.url,

			html: this.getHTMLString()
		};
	}
}

module.exports = MerchTag;