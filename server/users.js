const users = [];

function addUser({ id, name, room }) {
  name = name.trim().toLowerCase();
  room = room.trim().toLowerCase();

  const isUserExisted = users.find(
    (user) => user.room === room && user.name === name
  );
  if (isUserExisted) {
    return { error: 'Username is taken' };
  }

  const user = { id, name, room };
  users.push(user);
  return { user };
}
function removeUser(id) {
  const idx = users.findIndex((user) => user.id === id);
  if (idx !== -1) {
    return users.splice(idx, 1)[0];
  }
}
function getUser(id) {
  return users.find((user) => user.id === id);
}
function getUsersInRoom(room) {
  return users.filter((user) => user.room === room);
}

module.exports = { addUser, removeUser, getUser, getUsersInRoom };
