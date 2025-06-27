from math import *
import numpy
import numpy as np
import pyquaternion

import time
#import matplotlib.pyplot as plt
import scipy.stats as stats
import scipy.io as sio
import math

from scipy.spatial.transform import Rotation

import pandas
#from sklearn import preprocessing
# from tensorflow.keras.utils import np_utils


def get_angle(vec1, vec2, degree=False):
    dot_product = np.dot(vec1, vec2)
    cross_product = np.cross(vec1, vec2)

    # vec1 = vec1 / np.linalg.norm(vec1)
    # vec2 = vec2 / np.linalg.norm(vec2)

    ret_angle = np.arctan2(np.dot([0, 1, 0], cross_product), dot_product)

    return ret_angle


def rotate_on_plane(vec, angle):

    rotation_matrix = np.array([
        [np.cos(angle), 0, np.sin(angle)],
        [0, 1, 0],
        [-np.sin(angle), 0, np.cos(angle)]
    ])

    return numpy.dot(vec, rotation_matrix)


def diff_wsize(arr, wsize, axis):
    z = np.zeros(wsize)
    print(z)
    a1 = np.insert(arr, len(arr), z, axis=axis)
    a2 = np.insert(arr, 0, z, axis=axis)
    ret = a1 - a2
    ret = ret[:-wsize].copy()
    ret = ret[wsize:].copy()
    return ret


def distance(a, b):
    return np.linalg.norm(a - b)


def angle_0(pj, cj):
    v1 = np.array([pj[0], pj[1], pj[2]])
    v2 = np.array([cj[0], cj[1], cj[2]])

    a = math.acos(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))

    return math.degrees(a)


def angle(tj, pj, cj):
    v1 = np.array([pj[0] - tj[0], pj[1] - tj[1], pj[2] - tj[2]])
    v2 = np.array([cj[0] - tj[0], cj[1] - tj[1], cj[2] - tj[2]])

    a = math.acos(np.dot(v1, v2) / (np.linalg.norm(v1) * np.linalg.norm(v2)))

    return math.degrees(a)



def dis3d(a, b):
    return tuple(map(lambda x, y: abs(x - y), a, b))


def normalize(v, tolerance=0.00001):
    mag2 = sum(n * n for n in v)
    if abs(mag2 - 1.0) > tolerance:
        mag = sqrt(mag2)
        v = tuple(n / mag for n in v)
    return v


def q_mult(q1, q2):
    w1, x1, y1, z1 = q1
    w2, x2, y2, z2 = q2
    w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2
    x = w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2
    y = w1 * y2 + y1 * w2 + z1 * x2 - x1 * z2
    z = w1 * z2 + z1 * w2 + x1 * y2 - y1 * x2
    return w, x, y, z


def q_conjugate(q):
    w, x, y, z = q
    return (w, -x, -y, -z)


def qv_mult(q1, v1):
    q2 = (0.0,) + v1
    return q_mult(q_mult(q1, q2), q_conjugate(q1))[1:]


def axisangle_to_q(v, theta):
    v = normalize(v)
    x, y, z = v
    theta /= 2
    w = cos(theta)
    x = x * sin(theta)
    y = y * sin(theta)
    z = z * sin(theta)
    return w, x, y, z


def q_to_axisangle(q):
    w, v = q[0], q[1:]
    theta = acos(w) * 2.0
    return normalize(v), theta


def q_to_mat4(q):
    x, y, z, w = q  # 0.0,0.0,0.0,0.0
    z = z
    y = y
    x = -x

    return numpy.array(
        [[1 - 2 * y * y - 2 * z * z, 2 * x * y - 2 * z * w, 2 * x * z + 2 * y * w, 0],
         [2 * x * y + 2 * z * w, 1 - 2 * x * x -
             2 * z * z, 2 * y * z - 2 * x * w, 0],
         [2 * x * z - 2 * y * w, 2 * y * z + 2 *
             x * w, 1 - 2 * x * x - 2 * y * y, 0],
         [0, 0, 0, 1]], 'f')


def fourarrtoqarr(arr):
    nframe = []
    for frame in arr:
        njoint = []
        for joint in frame:
            q = pyquaternion.Quaternion(joint)
            njoint.append(q)
        njoint = np.array(njoint)
        nframe.append(njoint)
    nframe = np.array(nframe)

    return nframe


def qarr_to_disqarr(qarra, qarrb):
    sa = qarra.shape

    ret = []
    lt = time.time()
    for tframe, nframe in zip(qarra, qarrb):
        for tjoint, njoint in zip(tframe, nframe):
            # lt = time.time()
            dis = pyquaternion.Quaternion.absolute_distance(tjoint, njoint)
            # print("i1 - time {}", format(time.time() - lt))

            # dis = pyquaternion.Quaternion.distance(tjoint, njoint)
            # print("2b - time {}", format(time.time() - lt))
            # lt = time.time()

            # sdis = pyquaternion.Quaternion.sym_distance(tjoint, njoint)
            # print("2b - time {}", format(time.time() - lt))
            # lt = time.time()

            # lt = time.time()
            # ret = np.array(ret, [dis,dis,dis,dis])
            # TODO four times in order to concatenate with x_input_abs
            ret.append([dis, dis, dis, dis])
            # print("i2 - time {}", format(time.time() - lt))

    # for tjoint, njoint in np.nditer([qarra, qarrb], flags=['external_loop'], order='C'):
    # for tjoint, njoint in np.nditer([tframe, nframe]):

    # qa = pyquaternion.Quaternion(tjoint)
    # qb = pyquaternion.Quaternion(njoint)
    # dis = pyquaternion.Quaternion.absolute_distance(tjoint, njoint)
    # ret.append([0, 0, 0, dis])

    # lt = time.time()
    ret = np.array(ret)
    # print("i3 - time {}", format(time.time() - lt))

    # lt = time.time()
    ret = ret.reshape((sa[0], sa[1], 4))
    # print("i4 - time {}", format(time.time() - lt))

    return ret


def arr_to_disqarr(qarra, qarrb):
    sa = qarra.shape

    ret = []
    lt = time.time()
    for tframe, nframe in zip(qarra, qarrb):
        for tjoint, njoint in zip(tframe, nframe):
            qa = pyquaternion.Quaternion(tjoint)
            qb = pyquaternion.Quaternion(njoint)
            dis = pyquaternion.Quaternion.absolute_distance(qa, qb)
            ret.append([0, 0, 0, dis])

    # lt = time.time()
    ret = np.array(ret)
    # print("i3 - time {}", format(time.time() - lt))

    # lt = time.time()
    ret = ret.reshape((sa[0], sa[1], 4))
    # print("i4 - time {}", format(time.time() - lt))

    return ret


def rotmat2quat(R):
    """
    Converts a rotation matrix to a quaternion
    Matlab port to python for evaluation purposes
    https://github.com/asheshjain399/RNNexp/blob/srnn/structural_rnn/CRFProblems/H3.6m/mhmublv/Motion/rotmat2quat.m#L4
    Args
      R: 3x3 rotation matrix
    Returns
      q: 1x4 quaternion
    """
    rotdiff = R - R.T

    r = np.zeros(3)
    r[0] = -rotdiff[1, 2]
    r[1] = rotdiff[0, 2]
    r[2] = -rotdiff[0, 1]
    sintheta = np.linalg.norm(r) / 2
    r0 = np.divide(r, np.linalg.norm(r) + np.finfo(np.float32).eps)

    costheta = (np.trace(R) - 1) / 2

    theta = np.arctan2(sintheta, costheta)

    q = np.zeros(4)
    q[0] = np.cos(theta / 2)
    q[1:] = r0 * np.sin(theta / 2)
    return q


def expmap2rotmat(r):
    """
  Converts an exponential map angle to a rotation matrix
  Matlab port to python for evaluation purposes
  I believe this is also called Rodrigues' formula
  https://github.com/asheshjain399/RNNexp/blob/srnn/structural_rnn/CRFProblems/H3.6m/mhmublv/Motion/expmap2rotmat.m

  Args
    r: 1x3 exponential map
  Returns
    R: 3x3 rotation matrix
  """

    theta = np.linalg.norm(r)
    r0 = np.divide(r, theta + np.finfo(np.float32).eps)
    r0x = np.array([0, -r0[2], r0[1], 0, 0, -r0[0], 0, 0, 0]).reshape(3, 3)
    r0x = r0x - r0x.T
    R = np.eye(3, 3) + np.sin(theta) * r0x + \
        (1 - np.cos(theta)) * (r0x).dot(r0x)

    return R


def quat2expmap(q):
    """
    Converts a quaternion to an exponential map
    Matlab port to python for evaluation purposes
    https://github.com/asheshjain399/RNNexp/blob/srnn/structural_rnn/CRFProblems/H3.6m/mhmublv/Motion/quat2expmap.m#L1

    Args
      q: 1x4 quaternion
    Returns
      r: 1x3 exponential map
    Raises
      ValueError if the l2 norm of the quaternion is not close to 1
    """
    if (np.abs(np.linalg.norm(q) - 1) > 1e-3):
        raise (ValueError, "quat2expmap: input quaternion is not norm 1")

    sinhalftheta = np.linalg.norm(q[1:])
    coshalftheta = q[0]

    r0 = np.divide(q[1:], (np.linalg.norm(q[1:]) + np.finfo(np.float32).eps))
    theta = 2 * np.arctan2(sinhalftheta, coshalftheta)
    theta = np.mod(theta + 2 * np.pi, 2 * np.pi)

    if theta > np.pi:
        theta = 2 * np.pi - theta
        r0 = -r0

    r = r0 * theta
    return r


def analyze_data(data):
    dmin = np.amin(data.flatten())
    dmax = np.amax(data.flatten())
    mean = np.mean(data)
    dev = np.std(data)

    return dmin, dmax, mean, dev

def dis_ang(a, b=0, bas=2 * math.pi):
    ret = abs((a % bas) - (b % bas))
    ret = min(ret, bas - ret)
    return ret


def std_data(data):
    mean = np.mean(data)
    dev = np.std(data)

    ret = ((data - mean) / dev)

    return ret, mean, dev


def norm_data(data, dmin=None, dmax=None):
    ret = []

    if not dmin:
        dmin = np.amin(data.flatten())
    if not dmax:
        dmax = np.amax(data.flatten())

    # for d in data:
    #    ret.append((d - dmin) / (dmax - dmin))

    ret = (data - dmin) / (dmax - dmin)
    ret = np.array(ret)

    return ret, dmin, dmax


def denorm_data(data):
    return 0


def destd_data(data, mean, dev):
    ret = data * dev
    ret = ret + mean
    return ret


def sumofdist(arra, arrb):
    distsum = 0
    for posa, posb in zip(arra, arrb):
        p1 = (posa[0], posa[1])
        p2 = (posb[0], posb[1])
        # yo = p1 + p2
        dis = math.sqrt(sum([(x - y) ** 2 for x, y in zip(p1, p2)]))
        distsum += dis

    return distsum


def dists(arra, arrb):
    arra = prds = np.cumsum(arra, axis=0)
    arrb = prds = np.cumsum(arrb, axis=0)

    distarr = [0]
    for posa, posb in zip(arra, arrb):
        p1 = (posa[0], posa[1])
        p2 = (posb[0], posb[1])
        # yo = p1 + p2
        dis = math.sqrt(sum([(x - y) ** 2 for x, y in zip(p1, p2)]))
        distarr.append(dis)

    return distarr


def chkListEqual(lst):
    if len(lst) < 0:
        res = True
    res = all(ele == lst[0] for ele in lst)

    return res


def mse(arra, arrb, ax, weight=False):
    l = len(arra)
    w = []
    for i in range(l):
        # wi = np.ones(trout.shape[0])
        wi = 1 - (i / l)
        w.append(np.array(wi))
    w = np.array(w)

    if weight:
        arra = np.array([x * y for x, y in zip(w, arra)])
        arrb = np.array([x * y for x, y in zip(w, arrb)])

    ret = ((arra - arrb) ** 2).mean(axis=ax)

    return ret


def conv_quatarr_to_yprarr(arr):
    sh = arr.shape
    ret = []
    # TODO type check
    for q in arr.flatten():
        ret.append(q.yaw_pitch_roll)
    ret = np.array(ret).reshape((sh[0], sh[1], 3))
    return ret


def check_nan_inf_zero(ndata):
    if np.isnan(ndata).any():
        raise NameError('Data contains NaNs!')
    if np.isinf(ndata).any():
        raise NameError('Data contains Infs!')
    if np.all((ndata.flatten() == 0)):
        raise NameError('Data contains only 0s!')


def batch_auto_reshape(x, fn, shape_in, shape_out):
    reshape = x.ndim - len(shape_in) > 1
    xx = x.reshape(-1, *shape_in) if reshape else x
    y = fn(xx)
    return y.reshape(x.shape[: -len(shape_in)] + shape_out) if reshape else y


def A2R(A):
    return batch_auto_reshape(
        A, lambda x: Rotation.from_rotvec(x).as_matrix(), (3,), (3, 3),
    )


def E2R(theta, order):
    return Rotation.from_euler(order, theta, degrees=True).as_matrix()
    # return Rotation.from_euler("zxy", theta, degrees=True).as_matrix()


def R2Q(R):
    return batch_auto_reshape(
        R, lambda x: Rotation.from_matrix(x).as_quat(), (3, 3), (4,),
    )


def E2Q(theta, order):
    # Rotation.from_euler()
    # a = 1
    return R2Q(E2R(theta, order))


def A2Q(A):
    ret = batch_auto_reshape(
        A, lambda x: Rotation.from_rotvec(x).as_quat(), (3,), (4,),)
    ret = ret[:, [1, 2, 3, 0]]
    return ret


def crr(rots):
    ret = []  # np.zeros(rots.shape)
    for frame in rots:
        f = []
        for r in frame:
            r_o = [r[1], r[2], r[3], r[0]]
            # order is iimportant!
            # rot = Rotation.from_euler('x', -90, degrees=True) * Rotation.from_quat(r_o)
            rot = Rotation.from_quat(r_o)
            e = rot.as_euler('xyz', degrees=True)
            e = Rotation.from_euler('xzy', e, degrees=True)

            rot = e.as_quat()
            rot = [rot[3], rot[0], rot[1], rot[2]]
            f.append(rot)
        ret.append(f)
    ret = np.array(ret)
    return ret


def globrot_locrot_frame(gr_frame, j_dict):
    lr_frame = np.zeros(gr_frame.shape)
    # order in scipy is x,y,z,w ...  for xsens w,x,y,z
    gr_frame = gr_frame[:, [1, 2, 3, 0]]

    gr_inv = []
    for g in gr_frame:
        q = Rotation.from_quat(g)
        e = q.as_euler('xyz', degrees=True)
        f = Rotation.from_euler('xyz', [e[1], e[2], e[0]], degrees=True)
        r = q * Rotation.from_euler('x', -90, degrees=True)
        gr_inv.append(r.as_quat())
        # gr_inv.append(q.inv().as_quat())
    gr_inv = numpy.array(gr_inv)

    for this_joint in j_dict:
        jid_this = this_joint['id']

        this_rot = gr_inv[int(jid_this)]
        # this_rot = [this_rot[1], this_rot[2], this_rot[3], this_rot[0]]
        # this_rot = Rotation.from_quat(this_rot)
        # this_rot = this_rot.as_quat()

        lr_frame[jid_this] = this_rot
        a = 1

    lr_frame = gr_inv[:, [3, 0, 1, 2]]
    return lr_frame


def convert_to_quatrots(rots, rot_rep):
    
    framecount = rots.shape[0]
    jointcount = rots.shape[1]

    print("Converting rotations to Quaternion for {} frames.".format(framecount))

    ret_ = np.array([utils.E2Q(r, self.desc.rot_order) for r in rrots])

    ret = []
    for frame in rots:
        for joint_rot in frame:
            rot = Rotation.from_euler(rot_rep, joint_rot, degrees=True)
            quat = rot.as_quat()
            ret.append(quat)

    print("done.")
    ret = np.array(ret)
    ret = ret.reshape(framecount, jointcount, 4)

    return ret_

# used by: MVNX, BVH, AMASS (NPZ)
# needs quaternion as in rots-array

def array_to_dict(arr, key):
    ret = {}
    for item in arr:
        try:
            k = item[key]
            ret[k] = item
        except:
            raise Warning("Key {} is not in array".format(key))

    return ret

def index_of_jid(graph, jid):
    index_counter = 0
    for item in graph:
        if item['id'] == jid:
            return index_counter
        index_counter += 1

def rots2pos(offset, rots, joint_dict, offs_rel, rots_rel):
    abs_poss = np.zeros((rots.shape[0], 3))
    intd = numpy.zeros(rots.shape[0], dtype=bool)

    for this_joint in joint_dict:       

        jid_this = this_joint['id']
        jid_parent = this_joint['pid']

        # since ids are not index
        jid_index = index_of_jid(joint_dict,jid_this)
        jid_parent_index = index_of_jid(joint_dict,jid_parent)

        # array of parents until root element
        par_trace = getParentTrace(joint_dict, this_joint)

        if jid_parent == -1:
            offset_par = [0.0, 0.0, 0.0]
            abs_pos_par = [0.0, 0.0, 0.0]
        else:
            offset_par = offset[jid_parent_index]
            abs_pos_par = abs_poss[jid_parent_index]
            if intd[jid_parent_index] == False:
                raise RuntimeError("TODO! HIERARCHY IS NOT ORDERED!!")

        

        offset_this = offset[jid_index]

        if offs_rel:
            # bvh has relative offsets
            vec = offset_this
        else:
            # amass uses absolute offsets # TODO details
            vec = [offset_this[0] - offset_par[0], offset_this[1] -
                   offset_par[1], offset_this[2] - offset_par[2]]

        if rots_rel:
            parent_rotation_quat = rots[int(jid_parent_index)]
            parent_rotation = Rotation.from_quat(parent_rotation_quat)
            # e = parent_rotation.as_euler('xyz', degrees=True)

            if jid_index != 0:
                vec = parent_rotation.apply(vec)

            # vec = Rotation.from_euler('x', -90, degrees=True).apply(vec)

            abs_poss[jid_index] = np.array(abs_poss[jid_parent_index] + vec)
            intd[jid_index] = True

        else:
            # TODO improve performance. Not necessary to calc the whole rotation trace multiple times.
            for trace_parent_id in par_trace:

                trace_parent_id_index = index_of_jid(joint_dict,trace_parent_id)

                parent_roation_quat = rots[int(trace_parent_id_index)]
                quat_reorder = [parent_roation_quat[3], parent_roation_quat[0],
                                parent_roation_quat[1], parent_roation_quat[2]]
                parent_rotation = Rotation.from_quat(quat_reorder)
                e = parent_rotation.as_euler('xyz', degrees=True)

                vec = parent_rotation.apply(vec)

            abs_poss[jid_index] = np.array(abs_pos_par) + np.array(vec)

            intd[jid_index] = True

    return abs_poss

def bvhtree_to_data(bvh_tree, order=["Xrotation","Yrotation","Zrotation"]):

    graph = []
    offsets = []

    rot_inds = []
    pos_inds = []

    channel_counter = 0

    for joint in bvh_tree.get_joints(end_sites=False):      

            offs = bvh_tree.joint_offset(joint.name)
            offsets.append(offs)

            jid = bvh_tree.get_joint_index(joint.name)             

            naj = joint.name     
            nap = bvh_tree.joint_parent(joint.name)

            if nap is not None:
                pid = bvh_tree.get_joint_index(nap.name)
            else:
                pid = -1            
            
            item_dict = {}
            item_dict['id']= jid
            item_dict['pid'] = pid
            item_dict['name'] = joint.name

            graph.append(item_dict)
     
            chans = bvh_tree.joint_channels(joint.name)      

            joint_pos_inds = []
            joint_rot_inds = []
            
            # do position channels
            x_pind = get_index_of_key(chans, "Xposition")
            y_pind = get_index_of_key(chans, "Yposition")
            z_pind = get_index_of_key(chans, "Zposition")         
            
            joint_pos_inds.append(x_pind+channel_counter)
            joint_pos_inds.append(y_pind+channel_counter)
            joint_pos_inds.append(z_pind+channel_counter)

            pos_inds.append(joint_pos_inds)
            
            #removes all unmatched indices (-1)
            joint_pos_inds = [x for x in joint_pos_inds if x != -1]

            # do rotation channels

            x_rind = get_index_of_key(chans, order[0])
            y_rind = get_index_of_key(chans, order[1])
            z_rind = get_index_of_key(chans, order[2])      

            joint_rot_inds.append(x_rind+channel_counter)
            joint_rot_inds.append(y_rind+channel_counter)
            joint_rot_inds.append(z_rind+channel_counter)
            
            #removes all unmatched indices (-1)
            joint_rot_inds = [x for x in joint_rot_inds if x != -1]

            rot_inds.append(joint_rot_inds)

            channel_counter += len(chans)                
            a = 1

    return graph, offsets, rot_inds, pos_inds


def get_index_of_key(arr, key):
    try:
        return arr.index(key)
    except:
        print("Key {} not in array. Returning -1 as index.".format(key))
        return -1



def get_hier_from_bvh(bvh_tree):
    # modified from https://github.com/OlafHaag/bvh-toolbox/blob/master/src/bvhtoolbox/convert/bvh2csv.py
    # write_joint_hierarchy
    """Write joints' world positional data to a CSV file.

    :param bvh_tree: BVH tree that holds the data.
    :type bvh_tree: BvhTree
    :param filepath: Destination file path for CSV file.
    :type filepath: str
    :param scale: Scale factor for offset values.
    :type scale: float
    :return: If the write process was successful or not.
    :rtype: bool
    """
    scale = 1.0
    hier = list()
    offsets = []
    for joint in bvh_tree.get_joints(end_sites=True):
        joint_name = joint.name
        parent_name = bvh_tree.joint_parent(
            joint_name).name if bvh_tree.joint_parent(joint_name) else ''
        row = [joint_name, parent_name]
        offsets.append(
            [scale * offset for offset in bvh_tree.joint_offset(joint.name)])
        # row.extend((scale * offset for offset in bvh_tree.joint_offset(joint.name)))
        hier.append(tuple(row))

    hier = np.array(hier, dtype=[('joint', np.str_, 20),
                                 ('parent', np.str_, 20)])

    return hier, offsets


def get_rots_from_bvh(bvh_tree, id_name_dict):
    """Write joints' rotation data to a CSV file.

    :param bvh_tree: BVH tree that holds the data.
    :type bvh_tree: BvhTree
    :param filepath: Destination file path for CSV file.
    :type filepath: str
    :return: If the write process was successful or not.
    :rtype: bool
    """

    time_col = np.array([i * bvh_tree.frame_time for i in range(0, bvh_tree.nframes)])[:,
                                                                                       None]  # np.arange(0, bvh_tree.nframes * bvh_tree.frame_time, bvh_tree.frame_time)[:, None]
    # data_list = [time_col]
    # header = ['time']
    num_joints = len(id_name_dict)
    # Adding via indices. Endeffectors will have 0 rotation
    rot = np.zeros((bvh_tree.nframes, num_joints * 3))
    # a = bvh_tree.get_joints()

    pos = []
    for joint in bvh_tree.get_joints():
        print(joint)
        a = bvh_tree.joint_channels(joint.name)

        id = id_name_dict[joint.name]
        channels_rot = [channel for channel in bvh_tree.joint_channels(joint.name) if
                        channel[1:] == 'rotation']  # possibly each joint has a different order
        # header.extend(['{}.{}'.format(joint.name, channel[:1].lower()) for channel in channels_rot]) # ?
        jchans = bvh_tree.frames_joint_channels(joint.name, channels_rot)

        app = np.array(jchans)
        cnr = id * 3
        rot[:, cnr] = app[:, 0]
        rot[:, cnr + 1] = app[:, 1]
        rot[:, cnr + 2] = app[:, 2]

        channels_pos = [channel for channel in bvh_tree.joint_channels(
            joint.name) if channel[1:] == 'position']
        if len(channels_pos) > 0:
            # header.extend(['{}.{}'.format(joint.name, channel[:1].lower()) for channel in channels_pos]) #?
            app = np.array(bvh_tree.frames_joint_channels(
                joint.name, channels_pos))
            pos.append(app)

        # data_list.append(app)

    # pos = []
    # for joint in bvh_tree.get_joints():
    #     channels = [channel for channel in bvh_tree.joint_channels(joint.name) if channel[1:] == 'position']
    #     header.extend(['{}.{}'.format(joint.name, channel[:1].lower()) for channel in channels])
    #
    #     app = np.array(bvh_tree.frames_joint_channels(joint.name, channels))
    #     pos.append(app)

    # time = time_col[0]
    # rots = np.array(data_list[1:])
    # data = np.moveaxis(d,1,0)

    # TODO if position channels are just defined for root element ... will this happen?

    data = np.concatenate((pos[0], rot), axis=1)
    data = np.concatenate((time_col, data), axis=1)

    return data


def getParentTrace(vert_dict, vert):
    vid_this = vert['id']
    vid_parent = vert['pid']
    _vidp = vid_parent

    par_trace = []
    while (_vidp != -1):
        for v in vert_dict:
            if v['id'] == _vidp:
                _vidp = v['pid']
                par_trace.append(int(v['id']))

    return par_trace


def movimat2dict(filename):
    # https://github.com/saeed1262/MoVi-Toolbox/blob/master/MoCap/utils.py
    """Converts MoVi mat files to a python nested dictionary.
    This makes a cleaner representation compared to sio.loadmat

    Arguments:
        filename {str} -- The path pointing to the .mat file which contains
        MoVi style mat structs

    Returns:
        dict -- A nested dictionary similar to the MoVi style MATLAB struct
    """
    # Reading MATLAB file
    data = sio.loadmat(filename, struct_as_record=False, squeeze_me=True)

    # Converting mat-objects to a dictionary
    for key in data:
        if key != "__header__" and key != "__global__" and key != "__version__":
            if isinstance(data[key], sio.matlab.mio5_params.mat_struct):
                data_out = matobj2dict(data[key])
    return data_out


def matobj2dict(matobj):
    """A recursive function which converts nested mat object
    to a nested python dictionaries

    Arguments:
        matobj {sio.matlab.mio5_params.mat_struct} -- nested mat object

    Returns:
        dict -- a nested dictionary
    """
    ndict = {}
    for fieldname in matobj._fieldnames:
        attr = matobj.__dict__[fieldname]
        if isinstance(attr, sio.matlab.mio5_params.mat_struct):
            ndict[fieldname] = matobj2dict(attr)
        elif isinstance(attr, np.ndarray) and fieldname == "move":
            for ind, val in np.ndenumerate(attr):
                ndict[
                    fieldname
                    + str(ind).replace(",", "").replace(")",
                                                        "").replace("(", "_")
                ] = matobj2dict(val)
        elif fieldname == "skel":
            tree = []
            for ind in range(len(attr)):
                tree.append(matobj2dict(attr[ind]))
            ndict[fieldname] = tree
        else:
            ndict[fieldname] = attr
    return ndict
