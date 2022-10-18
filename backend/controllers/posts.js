const Post = require("../models/posts");
const fs = require("fs");
const User = require("../models/user");
//envoyer les schema posts sur database(la route implenté)

exports.createpost = (req, res, next) => {
  const post = new Post({
    ...req.body,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: [],
    // http://localhost:3000/images/1662648355155-299811405_2660138807450930_5936707431684283662_n.jpeg
    image: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
  });
  post.save().then(() => res.status(201).json({ message: "post crée !" }));
};

//contenu dynamique enregistre les informations dans data base
exports.getAllposts = async (req, res, next) => {
  const post = await Post.find()
    .populate("userId")
    .sort({ createdAt: -1 })

    .then((post) => res.json(post))
    .catch((error) => res.status(400).json({ error }));
};

//Modifier route put fichier

exports.modifyposts = async (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .then(async (post) => {
     
      const filename = post.image.split("/images/")[1];
      // condition pour confirmer si l'utilisatuer a changé l'image et il était bien supprimé

      if (req.file && filename) {
        // images/62648355155-299811405_2660138807450930_5936707431684283662_n.jpeg
        fs.unlink(`images/${filename}`, (err) => {
          if (err) throw err;
        });
      }
      const postObject = req.file // file(nouveau img) front end va envoyer
        ? //if le frontend envoyer et changer une image
          {
            ...req.body,
            //revenir sur l'ancienne protocole https....pour envoyer database
            image: `${req.protocol}://${req.get("host")}/images/${
              req.file.filename
            }`,
          }
        : { ...req.body };

      //database
      Post.updateOne({ _id: req.params.id }, { ...postObject })
      
        .then(() => res.status(200).json({ message: "Post modifiée" }))
        .catch((error) => res.status(400).json({ error }));
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.deletepost = (req, res, next) => {
  Post.findOne({ _id: req.params.id })
    .then((post) => {
     
      const filename = post.image.split("/images/")[1];
      fs.unlink(`./images/${filename}`, () => {
        Post.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Post supprimée !" }))
          .catch((error) => res.status(400).json({ error }));
      });
    })
    .catch((error) => res.status(500).json({ error }));
};

//*************like/dislike************ */

exports.likePost = (req, res, next) => {


  Post.findOne({ _id: req.params.id })
    .then((post) => {
      if (post.usersLiked.includes(req.body.userId)) {
        Post.updateOne(
          { _id: req.params.id },
          {
            $pull: { usersLiked: req.body.userId },
            $inc: { likes: -1 },
          }
        )
          .then(() => res.status(201).json({ message: "like a été retiré !" }))
          .catch((error) =>
            res
              .status(500)
              .json({ message:  error })
          );
      } else {
        Post.updateOne(
          { _id: req.params.id },
          {
            $push: { usersLiked: req.body.userId },
            $inc: { likes: +1 },
          }
        )
          .then(() =>
            res.status(201).json({ message: "like a été ajouté !" })
          )
          .catch((error) =>
            res
              .status(500)
              .json({ message: error })
          );
      }
    })
    .catch((error) => res.status(500).json({ message: error }));
};