import mongoose from "mongoose";

const WhatMobileSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  nestedUrl: {
    type: String,
  },
  imgStr: {
    type: String,
  },
  price: {
    type: String,
  },
  detailedSpecs: {
    type: Object,
  },
});

const WhatMobile = mongoose.model("WhatMobile", WhatMobileSchema);
WhatMobile.createIndexes();
export default WhatMobile;
