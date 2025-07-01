import pprint
import numpy as np
import backend.api.pv_utils as utils
import scipy.io
import pyquaternion
import pandas
import pickle
import bvhtoolbox
from abc import abstractmethod
import importlib
import cdflib
#import itertools
import json
import xml.etree.ElementTree as ET
import mvnx
import ezc3d

class MotionDataReader:
    def __init__(self, motion_filename, descriptor_filename):
        with open(descriptor_filename, "r") as read_desc_file:
            descs = json.load(read_desc_file)

            if descs["format"] == "bvh":
                data = DataReaderBVH(motion_filename, descs)

            elif descs["format"] == "npy":
                data = DataReaderNPY(motion_filename, descs)

            elif descs["format"] == "npz":
                data = DataReaderNPZ(motion_filename, descs)

            elif descs["format"] == "pkl":
                data = DataReaderPKL(motion_filename, descs)

            elif descs["format"] == "csv":
                data = DataReaderCSV(motion_filename, descs)

            elif descs["format"] == "mmm":  
                data = DataReaderMMM(motion_filename, descs)

            elif descs["format"] == "mvnx":
                data = DataReaderMVNX(motion_filename, descs)

            elif descs["format"] == "matlab":
                data = DataReaderMatlab(motion_filename, descs)

            elif descs["format"] == "cdf":
                data = DataReaderCDF(motion_filename, descs)

            elif descs["format"] == "c3d":
                data = DataReaderC3D(motion_filename, descs)

            elif descs["format"] == "converter":
                data = DataConverter(motion_filename, descs)
            else:
                raise LookupError("Unknown file format")

            self.rotations = None
            self.positions = None
            self.timestamps = None

            #######################################################
            ### 1) convert rotations to quaternion, if necessary
            #######################################################

            # only if data has rotations
            if data.desc.read_attribute("rotations") != "none":

                print("Read rotations.")
                rots = data.getRots()
           
                # EULER XYZ
                if data.desc.descfile["rotation-representation"] == "euler_xyz":
                    print("Convert from Euler XYZ.")
                    self.rotations = np.array([utils.E2Q(r, "XYZ") for r in rots])
                    self.rotations = self.rotations[:, :, [1, 2, 3, 0]]

                # EULER ZXY
                elif data.desc.descfile["rotation-representation"] == "euler_zxy":
                    print("Convert from Euler ZXY.")
                    self.rotations = np.array([utils.E2Q(r, "ZXY") for r in rots])
                    self.rotations = self.rotations[:, :, [1, 2, 3, 0]]
                
                # EULER ZYX
                elif data.desc.descfile["rotation-representation"] == "euler_zyx":
                    print("Convert from Euler ZYX.")
                    self.rotations = np.array([utils.E2Q(r, "ZYX") for r in rots])
                    self.rotations = self.rotations[:, :, [1, 2, 3, 0]]

                # EULER YXZ
                elif data.desc.descfile["rotation-representation"] == "euler_yxz":
                    print("Convert from Euler YXZ.")
                    self.rotations = np.array([utils.E2Q(r, "YXZ") for r in rots])
                    self.rotations = self.rotations[:, :, [1, 2, 3, 0]]

                # AXIS ANGLE
                elif (
                    data.desc.read_attribute("rotation-representation") == "axis-angle"
                ):
                    print("Convert from Axis-Angle.")
                    self.rotations = np.array([utils.A2Q(r) for r in rots])

                # QUATERNIONS
                elif (
                    data.desc.read_attribute("rotation-representation") == "quaternion"
                ):
                    print("Conversion not necessary. Rotations are already in quaternion.")
                    self.rotations = data.getRots()
            else:
                print("Rotations are not defined. Must be calculated from positions.")

            
            #######################################################
            ### 2) read positions, generate if necessary
            #######################################################


            if data.desc.read_attribute("positions") != "none":
                print("Read positions.")
                self.positions = data.getPoss()
            else:
                # Derive positions from rotations
                print("Calculating positions from rotations ...")

                if self.rotations is None:
                    raise LookupError("Neither position nor rotations are readable!")

                offs = data.desc.read_attribute("joint-offsets")
                graph = data.desc.read_attribute("joint-graph")

                is_rotation_relative = (
                    True
                    if data.desc.read_attribute("rotations") == "relative"
                    else False
                )

                is_offset_relative = (
                    True
                    if data.desc.read_attribute("offset-type") == "relative"
                    else False
                )

                self.positions = np.array(
                    [
                        utils.rots2pos(
                            offs, rot, graph, is_offset_relative, is_rotation_relative
                        )
                        for rot in self.rotations
                    ]
                )
                print("Done.")

            # scaling
            self.positions = self.positions / data.desc.read_attribute("scale")

            # dim-order
            self.positions = self.positions [:, :, data.desc.read_attribute("dim-order")]

            self.jointcount = self.positions.shape[1]
            self.framecount = self.positions.shape[0]

            ### 3) read rotations, generate if necessary
            if data.desc.read_attribute("rotations") != "none":
                # if rotations are not quaternion, conversion should have happend in 1)
                if "quaternion" in data.desc.descfile["rotation-representation"]:
                    self.rotations = data.getRots()
            else:
                # Derive positions from rotations
                print("Calculating rotations from positions ...")

                if self.positions is None:
                    raise LookupError("Neither rotaions nor positions are readable!")

                print(
                    "Creating position information from rotations ... but not yet. Simply no-rot as rot."
                )
                # TODO derive rotations from positions
                no_rot = pyquaternion.Quaternion()
                self.rotations = np.array([[no_rot] * self.jointcount] * self.framecount)
                print("Done.")

            # TODO get timestamps from data,if available
            self.timestamps = np.array([range(self.framecount)])

            self.joint_graph = data.desc.read_attribute("joint-graph")


    def generateNameList(self):
        names = []
        for this_joint in self.joint_graph:
            names.append(this_joint['name'])
        return names

    def generateJointHierarchyArray(self):
        hier = {}
        for this_joint in self.joint_graph:  # for each jointex joint
            vid_this = this_joint["id"]
            vid_parent = this_joint["pid"]

            # hierarchy array. for each index its parental id
            hier[vid_this] = vid_parent
        return hier


class MocapDataDesc():
    def __init__(self, descfile):
        self.descfile = descfile

        try:
            self.joint_graph = self.read_attribute("joint-graph")
            
        except:
            msg = "Joint graph defined in mocap file"
            print(msg)
            
    def has_attribute(self, attribute):
        try: 
            self.descfile[attribute]
            return True
        except:
            return False

    def set_attribute(self, attribute, value):
        self.descfile[attribute] = value
        print("Set Attribute key {}".format(attribute, value))

        

    def read_attribute(self, attribute):
        try:
            ret = self.descfile[attribute]
        except:
            msg = "Could not read Attribute key {} in JSON file".format(attribute)
            print(msg)            
            ret = None
            raise Warning(msg)
        return ret

class DataReader:
    def __init__(self, filename, desc):
        self.filename = filename
        self.desc = desc
        self.contain_nan = False
        self.type = "Not defined"
        self.global_trans = None
        self.framecount = 0

    def getPoss(self):
        return self.get_positions()

    def getRots(self):
        return self.get_rotations()

    # returns numpy array for positions with shape (framecount, jointcount, [x,y,z])
    @abstractmethod
    def get_positions(self):
        pass

    # returns numpy array for (quaternion) rotations with shape (framecount, jointcount, [x, y, z, w])
    @abstractmethod
    def get_rotations(self):
        pass


    @abstractmethod
    def generateVertDict(self):
        pass

class DataReaderMMM(DataReader):
    def __init__(self, filename, desc):
        # TODO make available for all XML Trees. e.g. parse tag names in json desc
        super().__init__(filename, MocapDataDesc(desc))

        self.mmm_decls = {}
        with open("mmm_hier.json", "r") as mmm_hier_file:
            self.mmm_decls = json.load(mmm_hier_file)

        # reads joint_graph from json file
        self.desc.joint_graph = self.mmm_decls["vdict"]
        self.desc.jointcount = len(self.desc.joint_graph)

        

        tree = ET.parse(filename)
        root = tree.getroot()

        # Explicitly navigate from <MMM> to <Motion>
        motion = root.find("Motion")
        if motion is None:
            raise ValueError("No Motion found in the XML file.")

        # MMM XML defines used joints in <JointOrder>
        joint_order = motion.find("JointOrder")

        if joint_order is None:
            raise ValueError("JointOrder not found in the XML file.")

        # List of Elements in <JointOrder>
        joints = joint_order.findall("Joint")

        # Creates an array of used Jointnames as name-attribute of <Joint>
        joints_xml_order = []
        for joint in joints:
            # name as defined in XML
            jname = joint.get("name")
            joints_xml_order.append(jname)

            # TODO test if name covers MMM definition (i.e. as extracted in mmm_hier.json file). Throw error if not

        motion_frames = motion.find("MotionFrames") if motion != None else None

        if motion_frames is None:
            raise ValueError("MotionFrames not found in the XML file.")

        # will hold time stamps for each frame
        timestamps = []

        # will hold joint data as defined in MMM-XML file
        joint_data = []

        # will hold root positions
        self.root_poss = []

        # will hold root rotations
        root_rots = []

        for frame in motion_frames.findall("MotionFrame"):
            timestep = float(frame.find("Timestep").text)
            timestamps.append(timestep)

            root_pos_text = frame.find("RootPosition").text
            self.root_poss.append(list(map(float, root_pos_text.split())))

            root_rot_text = frame.find("RootRotation").text
            root_rot_values = list(map(float, root_rot_text.split()))
            root_rots.append(np.array(root_rot_values))

            joint_data_text = frame.find("JointPosition").text.strip()
            joint_data_values = list(map(float, joint_data_text.split()))

            joint_data.append(np.degrees(joint_data_values))
        joint_data = np.array(joint_data)

        self.root_poss = np.array(self.root_poss)
        self.root_poss = self.root_poss[:, [2, 0, 1]]
        self.root_poss = self.root_poss / 1000.0

        self.framecount = joint_data.shape[0]

        # dataset assumes a table of size: framecount * dimensional-space (e.g. 3 for 3-axis rotation, as used in MMM-XML)
        self.dataset = np.zeros((self.framecount, self.desc.jointcount, 3))

        root_rots = np.array(root_rots)  # [:, [2, 0, 1]]
        # self.dataset[:, 0, :] = root_rots
        #
        # copies columns of MMM-XML data to appropriate columns of dataset.
        # Prefix joint name of MMM-XML and axis definition lead to dataset c olumn index.
        # This is weird but necessary due to inconsistent joint dimensions of MMM XML.
        # E.g. knees have only one rotational DOF, whil wrists have three.
        # This makes sense, but is quite unconventional, difficult to read and - above all - noone else does it likes this.
        for xml_joint_idx, xml_joint_name in enumerate(joints_xml_order):
            seg_dim, seg_name = next(
                (
                    (item["axis"], item["group_name"])
                    for item in self.mmm_decls["mmm"]
                    if item["name"] == xml_joint_name
                ),
                None,
            )

            vdict_joint_idx = next(
                (
                    item["id"]
                    for item in self.desc.joint_graph
                    if item["name"] == seg_name
                ),
                None,
            )

            # res_joint_idx = (vdict_joint_idx) + seg_dim.index(1)

            # dimension index. 0 if [1 0 0], 1 if [0 1 0], 2 [0 0 1]
            dim_ind = seg_dim.index(1)

            self.dataset[:, vdict_joint_idx, dim_ind] = joint_data[:, xml_joint_idx]

        # global_rots = root_rots[:, np.newaxis, :]
        # self.dataset = self.dataset + global_rots

        # self.dataset = self.dataset[:, :, [0, 2, 1]]

        # self.dataset = np.zeros(
        #    (self.desc.framecount, self.desc.jointcount, 3))

        self.offs = np.zeros((self.desc.jointcount, 3))

        segments = self.mmm_decls["segments"]
        for joint_item in self.desc.joint_graph:
            seg_off = next(
                (
                    seg_item["origin"]
                    for seg_item in segments
                    if joint_item["name"] == seg_item["name"]
                ),
                None,
            )

            self.offs[joint_item["id"]] = seg_off

        self.timestamps = np.array(timestamps).reshape(-1, 1)  # Column vector

    def get_positions(self):
        print("Creating position information from rotations ...")

        print("Euler to Quaternion.")
        rs = np.array([utils.E2Q(r, "XYZ") for r in self.dataset])

        ps = np.array(
            [
                utils.rots2pos(self.offs, r, self.desc.joint_graph, True, True)
                for r in rs
            ]
        )

        ps = ps[:, :, [0, 2, 1]]
        # ps = ps + self.root_poss[:, np.newaxis, :]
        print("Done.")

        return ps

class DataReaderMVNX(DataReader):
    def __init__(self, filename, desc):
        super().__init__(filename, MocapDataDesc(desc))
        print("reading {}".format(filename))

        self.dataset = mvnx.load(filename)

        self.desc.jointcount = int(self.dataset.segmentCount)
        self.framecount = len(self.dataset.time)

        # default indices for indexing values in <rotation> and <position> tags
        self.rotinds = [
            [i, i + 1, i + 2, i + 3] for i in range(0, int(self.desc.jointcount) * 4, 4)
        ]
        self.posinds = [
            [i, i + 1, i + 2] for i in range(0, self.desc.jointcount * 3, 3)
        ]

    def get_positions(self):
        poss = self.dataset.position[:, self.posinds]
        return poss

    def get_rotations(self):
        rots = self.dataset.orientation[:, self.rotinds]
        rots = rots[:, :, [1, 2, 3, 0]]
        return rots


class DataTableReader(DataReader):
    def __init__(self, filename, desc):
        super().__init__(filename, desc)

    def get_data(self, att_name):
        ds = np.array(self.dataset)

        if self.desc.has_attribute("data-order"):
            o = self.desc.read_attribute("data-order")
            ds = ds.transpose(o[0],o[1],o[2])

        try:
            inds = self.desc.read_attribute(att_name)
            try:
                ds = ds[:, inds]
            except:
                raise Warning("Indices do not match datasize")
        except:
            print("No indices defined. Assuming {} is inheritly set.".format(att_name))

        ds = ds.astype(float)
        return ds


    def get_positions(self):
        return self.get_data("joint-pos-cols")

    def get_rotations(self):
        return self.get_data("joint-rot-cols")


class DataConverter(DataTableReader):
    type = "converted"

    def __init__(self, filename, desc):
        func = desc["converter"]["func"]
        imp = importlib.import_module(desc["converter"]["module"])

        meth = getattr(imp, func)
        self.dataset = meth(filename)
        self.contain_nan = np.isnan(self.dataset).any()

        super().__init__(filename, MocapDataDesc(desc))

class DataReaderCDF(DataTableReader):
    type = "cdf"

    def __init__(self, filename, desc):
        cdf_file = cdflib.CDF(filename)
        name = desc["data-array-name"]
        self.dataset = cdf_file.varget(name)[0]

        super().__init__(filename, MocapDataDesc(desc))

class DataReaderCSV(DataTableReader):
    type = "csv"

    def __init__(self, filename, desc):
        super().__init__(filename, MocapDataDesc(desc))

        # TODO whitespace versus separator
        if desc["separator"] == " ":
            dataframe = pandas.read_csv(
                filename, delim_whitespace=True, header=desc["header-size"]
            )
        else:
            dataframe = pandas.read_csv(
                filename, sep=desc["separator"], header=desc["header-size"]
            )

        # dataframe = dataframe.applymap(lambda x: pd.to_numeric(x, errors='ignore'))

        self.dataset = dataframe.values

        self.contain_nan = dataframe.isnull().any().any()

class DataReaderMatlab(DataTableReader):
    type = "matlab"

    def __init__(self, filename, desc):
        super().__init__(filename, MocapDataDesc(desc))

        # TODO handle different mat types

        try:
            matname = desc["matlab-array-name"]
            if desc["abbrev"] == "mupots":
                mat = scipy.io.loadmat(
                    filename, struct_as_record=False, squeeze_me=True
                )
                dataarray = mat[matname]
                self.dataset = np.array([frame.annot3.T for frame in dataarray[:, 1]])
                self.dataset[:, :, 1] *= -1
            elif desc["abbrev"] == "movi":                

                mat = scipy.io.loadmat(
                    filename, struct_as_record=False, squeeze_me=True
                )
                all_data = np.array(mat[matname].S1.data)

                self.dataset = all_data
          

            elif desc["abbrev"] == "utd_new":
                mat = scipy.io.loadmat(
                    filename, struct_as_record=False, squeeze_me=True
                )
                self.dataset = np.array(mat[matname].world)
                #self.dataset = np.transpose(self.dataset, (2, 0, 1))
            
            else:
                mat = self.load_mat_file(filename)
                self.dataset = np.array(mat[matname])

        except LookupError:
            print("Error reading matlab file")       


        # self.dataset = np.moveaxis(self.dataset, -1, 0)
        self.contain_nan = np.isnan(self.dataset).any()

    def load_mat_file(self, filename):
        try:
            mat = scipy.io.loadmat(filename)
        except NotImplementedError:            
            print("Using mat73 package ...")
            import mat73
            mat = mat73.loadmat(filename)
        return mat
  
class DataReaderPKL(DataTableReader):
    type = "pkl"

    def __init__(self, filename, desc):
        if "pickle-array-name" not in desc:
            raise LookupError("pickle-array-name is not defined!")
        else:
            name = desc["pickle-array-name"]

        with open(filename, "rb") as f:
            u = pickle._Unpickler(f)
            u.encoding = "latin1"
            # if using Windows set "End Of Line Sequence" for each pkl file from CRLF to LF. ref: https://stackoverflow.com/questions/45368255/error-in-loading-pickle ... or batch conjoint
            p = u.load()
            # TODO handle for multiple poses per file
            self.dataset = p[name][0]
            self.contain_nan = np.isnan(self.dataset).any()

        super().__init__(filename, MocapDataDesc(desc))

class DataReaderBVH(DataTableReader):
    def __init__(self, filename, desc):
        super().__init__(filename, MocapDataDesc(desc))

        with open(filename) as f:
            bvh_tree = bvhtoolbox.BvhTree(f.read())

            if desc["rotation-representation"] == "euler_zxy":
                order =["Zrotation","Xrotation","Yrotation"]

            elif desc["rotation-representation"] == "euler_yxz":
                order =["Yrotation","Xrotation","Zrotation"]
            
            elif desc["rotation-representation"] == "euler_xyz":
                order =["Xrotation","Yrotation","Zrotation"]

            elif desc["rotation-representation"] == "euler_zyx":
                order =["Zrotation","Yrotation","Xrotation"]

            else:
                print("Rot order in json not def for bvh")
            

            graph, offs, rot_inds, pos_inds = utils.bvhtree_to_data(bvh_tree, order)
            data = bvh_tree.frames

            d = utils.array_to_dict(graph, 'id')

        ### make indices gapless .e.g. [0,1,3,5,6] to [0,1,2,3,4]

        id_map_rev = {}

        id_map_rev[-1] = -1
        counter = 0
        for j in graph:
            id_map_rev[j['id']] = counter
            counter += 1
            
        mapped_graph = []
        for j in graph:
            mapped_dict = {}
            mapped_id = id_map_rev[j['id']]
            mapped_pid = id_map_rev[j['pid']]
            mapped_dict['id'] = mapped_id
            mapped_dict['pid'] = mapped_pid
            mapped_dict['name'] = j['name']
            mapped_graph.append(mapped_dict)
            a = 0

        ### done

        
        self.desc.set_attribute("joint-offsets",offs)
        self.desc.set_attribute("joint-rot-cols", rot_inds)
        self.desc.set_attribute("joint-pos-cols", pos_inds)

        #self.desc.joint_graph = mapped_graph
        self.desc.set_attribute("joint-graph", mapped_graph)
        self.dataset = np.array(data)
        
        #self.dataset = np.zeros(self.dataset.shape)

        self.framecount = self.dataset.shape[0]

class DataReaderNPY(DataTableReader):
    def __init__(self, filename, desc):
        super().__init__(filename, MocapDataDesc(desc))

        self.dataset =  np.load(filename, allow_pickle=True)
        self.dataset = self.dataset[0]
        a = 1

class DataReaderNPZ(DataTableReader):
    def __init__(self, filename, desc):
        super().__init__(filename, MocapDataDesc(desc))

        if "npz-array-name" not in desc:
            raise LookupError("npz-array-name is not defined!")
        else:
            name = desc["npz-array-name"]

        n =  np.load(filename)
        
        with np.load(filename) as f:
            self.dataset = f[name]
            self.framecount = self.dataset.shape[0]
            self.contain_nan = np.isnan(self.dataset).any()

            if desc["systemname"] == "SMPL":
                self.global_trans = f["trans"]  # TODO spec for amass
                self.global_trans = np.expand_dims(self.global_trans, axis=1)

class DataReaderC3D(DataTableReader):
    def __init__(self, filename, desc):
        super().__init__(filename, MocapDataDesc(desc))

        self.c3d = ezc3d.c3d(filename)

        # Returns the marker-positions (frames x marker x 3).
        # self.marker_data = self.c3d["data"]["points"]
        self.dataset = self.c3d["data"]["points"]
        # data is loaded ass 4 x frames x joints
        # 4th entry is always 1, 1st, 2nd and 3rd are x, y and z
        self.dataset = self.dataset[[0,1,2],:,:]
        pprint.pprint(self.dataset)

        # Returns the analog data (chanel x samples).
        self.analog_data = self.c3d['data']['analogs'][0]
        pprint.pprint(self.analog_data)

        # Returns the names of the marker.
        self.marker_names = self.c3d['parameters']['POINT']['LABELS']['value']
        pprint.pprint(self.marker_names)

        # Returns the framerate.
        self.framerate = self.c3d['header']['points']['frame_rate']
        pprint.pprint(self.framerate)

        # Returns the number of frames.
        self.framecount = self.c3d['data']['points'].shape[2]
        pprint.pprint(self.framecount)

